/*-------------------------------------------------
 * delet³ for Discord
 * Copyright (c) 2021 suvanl. All rights reserved.
 * See LICENSE.md in project root for license info.
 *------------------------------------------------*/


// Configure enviroment variables
require("dotenv").config();
const { JWT_SECRET, MONGO_STRING, PORT, TOKEN } = process.env;


// Node.js version check
const { blue, cyan, green, red, bold, underline } = require("chalk");

const nodeVer = process.version.slice(1);
const minVer = "16.6.0";
const recVer = "16.6.0";

const semver = require("semver");

if (!semver.satisfies(nodeVer, `>=${minVer}`)) throw new Error(red(`Node.js ${minVer} or higher is required - please update. v${recVer} is recommended.`));
else console.log(`Node.js version check ${green("passed")} ✔\nmin: ${red(minVer)} | recommended: ${green(recVer)} | current: ${underline.green(nodeVer)}\n`);


// Require modules needed for bot initialisation
const { Client, Collection } = require("discord.js");
const { promisify } = require("util");
const readdir = promisify(require("fs").readdir);
const restify = require("restify");
const mongoose = require("mongoose");
const rjwt = require("restify-jwt-community");
const klaw = require("klaw");
const path = require("path");

// Initialise client with @everyone disabled and with required gateway intents specified
const client = new Client({
    disableMentions: "everyone",
    intents: ["DIRECT_MESSAGES", "GUILDS", "GUILD_MEMBERS", "GUILD_MESSAGES", "GUILD_PRESENCES"]
});

// Get permission levels
client.permLevels = require("./core/settings/permLevels");

// Load in custom console logger
client.logger = require("./core/modules/Logger");

// Require custom misc functions
require("./core/functions/misc");

// Require custom core functions
klaw("./core/functions").on("data", item => {
    const file = path.parse(item.path);
    if (!file.ext || file.ext !== ".js") return;
    if (file.name === "misc") return;
    require(`${file.dir}${path.sep}${file.base}`)(client);
});


// Set up REST API server
const server = restify.createServer();
server.use(restify.plugins.bodyParser());
server.use(rjwt({ secret: JWT_SECRET }).unless({ path: ["/auth"] }));
server.listen(PORT, () => {
    mongoose.connect(MONGO_STRING, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false });
});

// Create connection to MongoDB database via REST API
const db = mongoose.connection;
db.on("error", err => console.log(err));
db.once("open", () => {
    require("./api/routes/users")(server);
    require("./api/routes/guilds")(server);
    require("./api/routes/dbusers")(server);
    client.logger.log(`REST API server started on port ${green(PORT)}`, "rdy");
});


// Save commands and aliases to collections
client.commands = new Collection();
client.aliases = new Collection();

// Bot initialisation
const init = async () => {
    console.log(`Initialising ${bold("delet³")}...\n`);

    // Load events:
    // Read contents of "events" directory
    const events = await readdir("./events/");
    client.logger.log(`Loading ${cyan(events.length)} events:`);
    // For each event file...
    events.forEach(file => {
        // Remove the file extension from the filename
        const name = file.split(".")[0];
        client.logger.log(`✔ "${cyan(name)}"`);
        // Require each event file
        const event = require(`./events/${file}`);
        // Bind each event to the client
        client.on(name, event.bind(null, client));
    });

    // Load commands:
    // Read the contents of the "commands" directory
    client.logger.log("Loading commands:");
    // Initialise an empty array for command names
    const items = [];
    klaw("./commands")
        .on("data", item => {
            // Parse the path of each file in the commands directory (incl. sub-directories)
            const file = path.parse(item.path);
            // Return if the file doesn't have a ".js" extension
            if (!file.ext || file.ext !== ".js") return;
            // Add command names to the "items" array so that the total amount of commands can be determined
            items.push(item.path);
            // Load each command that's found
            const res = client.loadCommand(file.dir, file.name);
            // If the loadCommand function is unsuccessful, log the error
            if (!res) client.logger.err(res);
        })
        .on("end", () => client.logger.log(`Successfully loaded ${blue(items.length)} commands`));

    // Cache permLevels:
    // Initialise a new Map object
    client.levelCache = new Map();
    client.permLevels.levels.forEach(lev => {
        // Add each the level (Number) and name (String) of each permLevel to the Map
        client.levelCache.set(lev.level, lev.name);
    });

    // Log into Discord
    client.login(TOKEN);
};

init();
