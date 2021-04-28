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

const nodeVer = process.version.slice(1).split(".")[0];
const minVer = "12";
const recVer = "14";

if (nodeVer < 12) throw new Error(red(`Node.js ${minVer} or higher is required - please update. v${recVer} is recommended.`));
else console.log(`Node.js version check ${green("passed")} ✔\nmin: ${red(minVer)} | recommended: ${green(recVer)} | current: ${underline.green(nodeVer)}\n`);

// Bot initialisation
const { Client, Collection } = require("discord.js");
const { promisify } = require("util");
const readdir = promisify(require("fs").readdir);
const restify = require("restify");
const mongoose = require("mongoose");
const rjwt = require("restify-jwt-community");
const klaw = require("klaw");
const path = require("path");

const client = new Client({
    disableMentions: "everyone",
    ws: { intents: ["DIRECT_MESSAGES", "GUILDS", "GUILD_MEMBERS", "GUILD_MESSAGES", "GUILD_PRESENCES"] }
});

client.permLevels = require("./core/settings/permLevels");

// Load in custom console logger
client.logger = require("./core/modules/Logger");

// Require custom misc functions
require("./core/functions/misc");

// Require custom core functions
klaw("./core/functions")
    .on("data", item => {
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

const init = async () => {
    console.log(`Initialising ${bold("delet³")}...\n`);

    // Load events
    const events = await readdir("./events/");
    client.logger.log(`Loading ${cyan(events.length)} events:`);
    events.forEach(file => {
        const name = file.split(".")[0];
        client.logger.log(`✔ "${cyan(name)}"`);
        
        const event = require(`./events/${file}`);
        client.on(name, event.bind(null, client));
    });

    // Load commands
    client.logger.log("Loading commands:");
    const items = [];
    klaw("./commands")
        .on("data", item => {
            const file = path.parse(item.path);
            if (!file.ext || file.ext !== ".js") return;
            items.push(item.path);
            const res = client.loadCommand(file.dir, file.name);
            if (!res) client.logger.err(res);
        })
        .on("end", () => client.logger.log(`Successfully loaded ${blue(items.length)} commands`));


    // Cache permLevels
    client.levelCache = new Map();
    client.permLevels.levels.forEach(lev => {
        client.levelCache.set(lev.level, lev.name);
    });

    console.log(client.levelCache);

    // Discord login
    client.login(TOKEN);
};

init();
