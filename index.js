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
const { Client, Collection } = require("discord.js");
const { TOKEN, PREFIX } = process.env;
const { version } = require("./package.json");
const { readdirSync } = require("fs");

const client = new Client({
    disabledEvents: ["TYPING_START"],
    disableEveryone: true
});

// Handle commands
client.commands = new Collection();
const commandFiles = readdirSync("./commands").filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}

client.on("message", message => {
    if (!message.content.startsWith(PREFIX) || message.author.bot) return;

    const args = message.content.slice(PREFIX.length).split(/ +/);
    const commandName = args.shift().toLowerCase();
    
    if (!client.commands.has(commandName)) return;

    const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
    if (!command) return;

    if (command.guildOnly && message.channel.type !== "text") return message.channel.send("this command can't be used in DMs");

    if (command.args && !args.length) {
        let reply = "oops, you didn't provide any arguments!";
        if (command.usage) reply += `\nthe proper usage would be: \`${PREFIX}${command.name} ${command.usage}\``;
        return message.channel.send(reply);
    }

    const cooldowns = new Collection();
    if (!cooldowns.has(command.name)) cooldowns.set(command.name, new Collection());

    const now = Date.now();
    const timestamps = cooldowns.get(command.name);
    const cooldownAmount = (command.cooldown || 3) * 1000;

    if (timestamps.has(message.author.id)) {
        const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

        if (now < expirationTime) {
            const timeLeft = (expirationTime - now) / 1000;
            return message.reply(`please wait ${timeLeft.toFixed(1)} more second(s) before using the \`${command.name}\` command again`);
        }
    }

    timestamps.set(message.author.id, now);
    setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

    try {
        command.exec(message, args);
    } catch (error) {
        console.error(red(error));
        message.channel.send("an error ocurred whilst running that command ❌");
    }
});

// Ready event
client.once("ready", () => {
    console.log(`Logged in to Discord as ${magenta(client.user.tag)} - ${cyan(`v${version}`)}`);
});

client.login(TOKEN);
