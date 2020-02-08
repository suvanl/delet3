/*-------------------------------------------------
 * delet³ for Discord
 * Copyright (c) 2020 suvanl. All rights reserved.
 * See LICENSE.md in project root for license info.
 *------------------------------------------------*/

// Configure enviroment variables
require("dotenv").config();
const { MONGO_STRING, PORT, TOKEN } = process.env;

// Node.js version check
const { blue, cyan, green, red, bold, underline } = require("chalk");

const nodeVer = process.version.slice(1).split(".")[0];
const minVer = "12";
const recVer = "12";

if (nodeVer < 12) throw new Error(red(`Node.js ${minVer} or higher is required - please update. v${recVer} is recommended.`));
else console.log(`Node.js version check ${green("passed")} ✔\nmin: ${red(minVer)} | recommended: ${green(recVer)} | current: ${underline.green(nodeVer)}\n`);

// Bot initialisation
const { Client } = require("discord.js");
const { promisify } = require("util");
const readdir = promisify(require("fs").readdir);
const restify = require("restify");
const mongoose = require("mongoose");

const client = new Client({
    disabledEvents: ["TYPING_START"],
    disableEveryone: true
});

// Load in custom console logger
client.logger = require("./core/modules/Logger");

// Require custom core functions
require("./core/functions/loadCommand.js")(client);

// Set up REST API server
const server = restify.createServer();
server.use(restify.plugins.bodyParser());
server.listen(PORT, () => {
    mongoose.connect(MONGO_STRING, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false });
});

const db = mongoose.connection;
db.on("error", err => console.log(err));
db.once("open", () => {
    require("./api/routes/users")(server);
    require("./api/routes/guilds")(server);
    client.logger.log(`REST API server started on port ${green(PORT)}`, "rdy");
});

// todo: obviously these shouldn't be null; handle db stuff here
client.commands = null;
client.aliases = null;

client.settings = null;

const init = async () => {
    console.log(`Initialising ${bold("delet³")}...\n`);

    // Load commands
    const commands = await readdir("./commands/");
    client.logger.log(`Loading ${blue(commands.length)} commands:`);
    commands.forEach(file => {
        if (!file.endsWith(".js")) return;
        const response = client.loadCommand(file);
        if (response) console.log(response);
    });

    // Load events
    const events = await readdir("./events/");
    client.logger.log(`Loading ${cyan(events.length)} events:`);
    events.forEach(file => {
        const name = file.split(".")[0];
        client.logger.log(`✔ "${cyan(name)}"`);
        
        const event = require(`./events/${file}`);
        client.on(name, event.bind(null, client));
    });

    // todo: permLevel stuff

    // Discord login
    client.login(TOKEN);
};

init();
