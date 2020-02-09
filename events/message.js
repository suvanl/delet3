module.exports = async (client, message) => {
    // Return if guild is unavailable (due to server outage)
    if (!message.guild.available) return;

    // Ignore messages from other bot accounts
    if (message.author.bot) return;

    // Return if bot has insufficient perms to send messages
    if (message.channel.type === "text" && !message.guild.me.hasPermission("SEND_MESSAGES")) return;

    // Fetch guild/default settings from REST API
    const settings = message.settings = client.getSettings(mesage.guild);

    // Respond with prefix if mentioned
    // todo: use localisation rather than direct string input
    const mention = new RegExp(`^<@!?${client.user.id}> `);
    if (message.content.match(mention)) return message.channel.send(`My prefix on this server is: \`${settings.prefix}\`.`);

    // Ignore messages that don't start with the bot's prefix
    if (message.content.indexOf(settings.prefix) !== 0) return;

    // Separate command name from args; sort args into array
    const args = message.content.slice(settings.prefix.length).trim().split(/ +g/);
    const command = args.shift().toLowerCase();

    // Fetch guild member if invisible/uncached
    if (message.guild && !message.member) await message.guild.fetchMember(message.author);

    // todo: get user/member's permLevel

    // Check if command/alias exists in predefined collections
    const cmd = client.commands.get(command) || client.commands.get(client.aliases.get(command));
    if (!cmd) return;

    // todo: (1) set up command options (incl. guildOnly); (2) block guildOnly commands in DMs
    
    // todo: permLevel check + response

    // todo: change author's permLevel from being on `member` to `level`

    // todo: run (& log use of) command
};
