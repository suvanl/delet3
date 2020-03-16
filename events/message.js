const { blue } = require("chalk");

module.exports = async (client, message) => {
    // Return if guild is unavailable (due to server outage)
    if (!message.guild.available) return;

    // Ignore messages from other bot accounts
    if (message.author.bot) return;

    // Return if bot has insufficient perms to send messages
    if (message.channel.type === "text" && !message.guild.me.hasPermission("SEND_MESSAGES")) return;

    // Fetch guild/default settings from REST API
    const settings = message.settings = await client.getSettings(message.guild);

    // Respond with prefix if mentioned
    // todo: use localisation rather than direct string input
    const mention = new RegExp(`^<@!?${client.user.id}> `);
    if (message.content.match(mention)) return message.channel.send(`My prefix on this server is: \`${settings.prefix}\`.`);

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
    if (cmd && !message.guild && cmd.config.guildOnly) return message.channel.send("Oops, this command is unavailable in DMs.");
    
    // permLevel check + response
    // todo: include user's permLevel name/number and required permLevel name/number in response
    if (level < client.levelCache[cmd.config.permLevel]) return message.channel.send("You don't have permission to use this command.");

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
