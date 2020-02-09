module.exports = async (client, message) => {
    if (message.author.bot) return;

    // todo: get settings from mongodb

    const mention = new RegExp(`^<@!?${client.user.id}> `);

    // todo: (1) use localisation rather than direct string input; (2) replace with more user-friendly message; (3) get prefix from settings
    if (message.content.match(mention)) return message.channel.send("Prefix on this server: `3!`");

    // todo: ignore messages that don't start with (guild/default) prefix

    // todo: separate command name from args; sort args into array (Array.prototype.shift)

    // Fetch guild member if invisible/uncached
    if (message.guild && !message.member) await message.guild.fetchMember(message.author);

    // todo: get user/member's permLevel

    // Check if command/alias exists in predefined collections
    const cmd = client.commands.get(command) || client.commands.get(client.aliases.get(command));
    if (!cmd) return;

    // todo: (1) set up command options (incl. guildOnly); (2) block guildOnly commands in DMs
    
    // todo: permLevel check + response

    // todo: change author's permLevel from being on `member` to `level`

    // todo: run & log use of command
};
