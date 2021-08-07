const moment = require("moment");
const { blue } = require("chalk");
const { stripIndents } = require("common-tags");

module.exports = async (client, message) => {
    // Return if guild is unavailable (due to server outage)
    if (message.channel.type !== "DM" && !message.guild.available) return;

    // Ignore messages from other bot accounts
    if (message.author.bot) return;

    // Return if bot has insufficient perms to send messages
    if (message.channel.type === "GUILD_TEXT" && !message.guild.me.permissions.has("SEND_MESSAGES")) return;

    // Fetch guild/default settings from REST API
    const settings = message.settings = await client.getSettings(message.guild);

    // Respond with prefix if mentioned
    const mention = new RegExp(`^<@!?${client.user.id}> `);
    if (message.content.match(mention)) return message.channel.send(`${client.l10n(message, "help.prefix")} \`${settings.prefix}\`.`);

    // Points system:
    // - if in a guild, and points are enabled in settings:
    //  - if the current unix timestamp is greater than the cooldown (in seconds), add X points
    //    where X is a random integer between 10-20
    if (message.guild && message.settings.pointsEnabled) {
        const userData = await client.getUser(message.guild, message.author);

        const current = userData.points;
        const updated = userData.pointsUpdatedTimestamp;
        const cooldown = message.settings.pointsCooldown;
        const now = moment().unix();

        const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

        if (now > updated + (cooldown * 60)) await client.addPoints(message.guild, message.author, "points", current + randInt(10, 20));
    }

    // Ignore messages that don't start with the bot's prefix
    if (message.content.indexOf(settings.prefix) !== 0) return;

    // Separate command name from args; sort args into array
    const args = message.content.slice(settings.prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    // Fetch guild member if invisible/uncached
    if (message.guild && !message.member) await message.guild.fetchMember(message.author);

    // Get user/member's permLevel
    const level = client.permLevel(message);

    // Check if command/alias exists in predefined collections
    const cmd = client.commands.get(command) || client.commands.get(client.aliases.get(command));
    if (!cmd) return;

    // Block guildOnly commands in DMs
    if (cmd && !message.guild && cmd.config.guildOnly) return message.channel.send(`🚫 ${client.l10n(message, "dm.unavailable")}`);
    
    // permLevel check + response
    if (level < client.levelCache[cmd.config.permLevel]) return message.channel.send(stripIndents`
        ⛔ You don't have permission to use this command.
        Your permission level is: \`${level}\` (**${client.permLevels.levels.find(l => l.level === level).name}**);
        The required level is: \`${client.levelCache[cmd.config.permLevel]}\` (**${cmd.config.permLevel}**).`);

    // Change author's permLevel from being on `member` to `level`
    message.author.permLevel = level;

    // Handle message flags
    message.flags = [];
    while (args[0] && args[0][0] === "-") {
        message.flags.push(args.shift().slice(1));
    }

    // Run (& log use of) command
    const log = `${client.permLevels.levels.find(l => l.level === level).name} ${blue(message.author.tag)} (${message.author.id}) ran command ${blue(cmd.help.name)}`;

    client.logger.cmd(log);
    cmd.run(client, message, args, level);
};
