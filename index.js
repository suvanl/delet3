/*-------------------------------------------------
 * delet³ for Discord
 * Copyright (c) 2020 suvanl. All rights reserved.
 * See LICENSE.md in project root for license info.
 *------------------------------------------------*/

// Node.js version check
const { green, red, magenta, cyan, underline } = require("chalk");

const nodeVer = process.version.slice(1).split(".")[0];
const minVer = "12";
const recVer = "12";

if (nodeVer < 12) throw new Error(red(`Node.js ${minVer} or higher is required - please update. v${recVer} is recommended.`));
else console.log(`Node.js version check ${green("passed")} ✅\nmin: ${red(minVer)} | recommended: ${green(recVer)} | current: ${underline.green(nodeVer)}`);

// Configure enviroment variables
require("dotenv").config();

// Bot initialisation
const { Client } = require("discord.js");
const { TOKEN, PREFIX } = process.env;
const { version } = require("./package.json");

const client = new Client({
    disabledEvents: ["TYPING_START"],
    disableEveryone: true
});

client.once("ready", () => {
    console.log(`Logged in to Discord as ${magenta(client.user.tag)} - ${cyan(`v${version}`)}`);
});

client.on("message", message => {
    if (!message.content.startsWith(PREFIX) || message.author.bot) return;

    const args = message.content.slice(PREFIX.length).split(/ +/);
    const command = args.shift().toLowerCase();

    if (command === "ping") message.channel.send("pong 🏓");
});

client.login(TOKEN);
