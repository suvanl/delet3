/*--------------------------------------------------------------------------------
 * delet³ for Discord
 * Copyright (c) 2022 suvanl. All rights reserved.
 * Licensed under the MIT license. See LICENSE.md in project root for license info.
 *-------------------------------------------------------------------------------*/

// Configure enviroment variables
import "dotenv/config";

// Import modules needed for bot initialisation
import { Client, Collection } from "discord.js";
import { createClient } from "redis";
import { sep } from "path";
import chalk from "chalk";
import klaw from "klaw";
import path from "path";
import os from "os";

// Import settings, logger and useful functions
import permLevels from "./core/settings/permLevels.js";
import * as logger from "./core/modules/logger.js";
import functions from "./core/functions";
import startup from "./startup";

// Run startup methods
startup.nodeVersionCheck();
startup.initServer();

// Initialise delet3
const init = async () => {
    console.log(`Initialising ${chalk.bold("delet³")}...\n`);

    // Initialise client with @everyone disabled and with required gateway intents specified
    const client = new Client({
        disableMentions: "everyone",
        intents: ["DIRECT_MESSAGES", "GUILDS", "GUILD_MEMBERS", "GUILD_MESSAGES", "GUILD_PRESENCES"],
        partials: ["CHANNEL"]
    });

    // Attach permission levels to client object
    client.permLevels = permLevels;

    // Attach custom console logger as a property on the client object
    client.logger = logger;

    // Create Redis client and connect to server
    const redisClient = createClient();
    await redisClient.connect();

    // Listen for Redis errors
    redisClient.on("error", err => {
        throw new Error(err.message);
    });

    // Attach Redis client to Discord client object
    client.redis = redisClient;

    // Require custom misc functions
    import("./core/functions/misc.js");

    // Set up custom core functions - call each one, passing the client as an argument
    Object.values(functions).forEach(fn => fn(client));

    // Save commands, command aliases and slash commands to collections
    client.commands = new Collection();
    client.aliases = new Collection();
    client.slashCommands = new Collection();

    // Load events
    const loadedEvents = await startup.bindEvents(client);
    client.logger.log(`Successfully loaded ${chalk.cyan(loadedEvents)} events`);

    // Load ApplicationCommands:
    // Initialise empty array for ApplicationCommand names
    const appCmdArr = [];
    klaw("./interactions/commands")
        .on("data", async item => {
            const file = path.parse(item.path);
            if (!file.ext || file.ext !== ".js") return;

            appCmdArr.push(item.path);

            const props = await import(`${os.platform() === "win32" ? "file://" : ""}${file.dir}${sep}${file.name}`);
            if (props.init) props.init(client);
            client.slashCommands.set(props.data.name, props);
            client.logger.log(`✔ "${chalk.magenta(file.name)}"`);
        })
        .on("end", () => client.logger.log(`Successfully loaded ${chalk.magenta(appCmdArr.length)} ApplicationCommands`));


    // Load commands:
    // Initialise an empty array for command names
    const cmdArr = [];
    klaw("./commands")
        .on("data", async item => {
            // Parse the path of each file in the commands directory (incl. sub-directories)
            const file = path.parse(item.path);
            // Return if the file doesn't have a ".js" extension
            if (!file.ext || file.ext !== ".js") return;
            // Add command names to the "cmdArr" array so that the total amount of commands can be determined
            cmdArr.push(item.path);
            // Load each command that's found
            const res = await client.loadCommand(file.dir, file.name);
            // If the loadCommand function is unsuccessful, log the error
            if (res !== true) client.logger.error(res);
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
    client.login(process.env.TOKEN);
};

init();
