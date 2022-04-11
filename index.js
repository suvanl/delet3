/*-------------------------------------------------
 * delet³ for Discord
 * Copyright (c) 2022 suvanl. All rights reserved.
 * See LICENSE.md in project root for license info.
 *------------------------------------------------*/

// TODO: refactor


// Configure enviroment variables
import "dotenv/config";
const { JWT_SECRET, MONGO_STRING, PORT, TOKEN } = process.env;


// Node.js version check
import chalk from "chalk";
import { stripIndents } from "common-tags";

const nodeVer = process.version.slice(1);
const minVer = "16.6.0";
const recVer = "16.6";

import semver from "semver";
    
if (!semver.satisfies(nodeVer, `>=${minVer}`))
    throw new Error(chalk.red(`Node.js ${minVer} or higher is required - please update. v${recVer} is recommended.`));
else
   console.log(stripIndents`
        Node.js version check ${chalk.green("passed")} ✔
        min: ${chalk.red(minVer)} | recommended: ${chalk.green(recVer)} | current: ${chalk.underline.green(nodeVer)}\n`);

// Import modules needed for bot initialisation
import { Client, Collection } from "discord.js";
import { sep } from "path";
import restify from "restify";
import mongoose from "mongoose";
import rjwt from "restify-jwt-community";
import klaw from "klaw";
import path from "path";

import permLevels from "./core/settings/permLevels.js";
import * as logger from "./core/modules/logger.js";
import functions from "./core/functions";
import startup from "./startup";
import routes from "./api/routes";


// Set up REST API server
const server = restify.createServer();
server.use(restify.plugins.bodyParser());
server.use(rjwt({ secret: JWT_SECRET }).unless({ path: ["/auth"] }));
server.listen(PORT, () => {
    mongoose.connect(MONGO_STRING);
});

// Create connection to MongoDB database via REST API
const db = mongoose.connection;
db.on("error", err => console.log(err));
db.once("open", () => {
    Object.values(routes).forEach(route => route(server));
    //client.logger.log(`REST API server started on port ${chalk.green(PORT)}`, "rdy");  // TODO: actually use client.logger
    console.log(`REST API server started on port ${chalk.green(PORT)}`);
});

// Bot initialisation
const init = async () => {
    console.log(`Initialising ${chalk.bold("delet³")}...\n`);

    // Initialise client with @everyone disabled and with required gateway intents specified
    const client = new Client({
        disableMentions: "everyone",
        intents: ["DIRECT_MESSAGES", "GUILDS", "GUILD_MEMBERS", "GUILD_MESSAGES", "GUILD_PRESENCES"],
        partials: ["CHANNEL"]
    });

    // Get permission levels
    client.permLevels = permLevels;

    // Load in custom console logger
    client.logger = logger;

    // Require custom misc functions
    import("./core/functions/misc.js");

    // Set up custom core functions - call each one, passing the client as an argument
    Object.values(functions).forEach(fn => fn(client));

    // Save commands, command aliases and slash commands to collections
    client.commands = new Collection();
    client.aliases = new Collection();
    client.slashCommands = new Collection();

    // Load events
    startup.bindEvents(client);
    client.logger.log("Successfully loaded events");

    // Load ApplicationCommands:
    // Initialise empty array for ApplicationCommand names
    const appCmdArr = [];
    klaw("./interactions/commands")
        .on("data", async item => {
            const file = path.parse(item.path);
            if (!file.ext || file.ext !== ".js") return;

            appCmdArr.push(item.path);

            const props = await import(`file://${file.dir}${sep}${file.name}`); // TODO: only use "file://" on win32
            if (props.init) props.init(client);
            client.slashCommands.set(props.data.name, props);
            client.logger.log(`✔ "${chalk.magenta(file.name)}"`);
        })
        .on("end", () => client.logger.log(`Successfully loaded ${chalk.magenta(appCmdArr.length)} ApplicationCommands`));


    // Load commands:
    // Initialise an empty array for command names
    const cmdArr = [];
    klaw("./commands")
        .on("data", item => {
            // Parse the path of each file in the commands directory (incl. sub-directories)
            const file = path.parse(item.path);
            // Return if the file doesn't have a ".js" extension
            if (!file.ext || file.ext !== ".js") return;
            // Add command names to the "cmdArr" array so that the total amount of commands can be determined
            cmdArr.push(item.path);
            // Load each command that's found
            const res = client.loadCommand(file.dir, file.name);
            // If the loadCommand function is unsuccessful, log the error
            if (!res) client.logger.err(res);
        })
        .on("end", () => client.logger.log(`Successfully loaded ${chalk.blue(cmdArr.length)} commands`));


    // Cache permLevels:
    // Initialise a new Map object
    client.levelCache = new Map();
    client.permLevels.levels.forEach(lev => {
        // Add each the level (Number) and name (String) of each permLevel to the Map
        client.levelCache.set(lev.name, lev.level);
    });

    // Log into Discord
    client.login(TOKEN);
};

init();
