const { stripIndents } = require("common-tags");

exports.run = async (client, message, args) => {
    const msg = stripIndents`
        ⚙️ The current prefix is \`${message.settings.prefix}\`.
        🔄 Please enter the new prefix. Reply with \`cancel\` to exit.`;

    const newPrefix = args[0] || await client.awaitReply(message, msg);
    if (!newPrefix || newPrefix.toLowerCase() === "cancel") return message.channel.send("🚪 Ended the settings customisation procedure.");

    try {
        const update = await client.updateSettings(message.guild, "prefix", newPrefix);
        if (update === 200) return message.channel.send(`<:tick:688400118549970984> Prefix successfully changed to \`${newPrefix}\`.`);
    } catch (err) {
        message.channel.send("<:x_:688400118327672843> An error occurred whilst changing the prefix.");
        return client.logger.err(`Error changing prefix:\n${err.stack}`);
    }
};

exports.config = {
    aliases: [],
    enabled: true,
    guildOnly: true,
    permLevel: "Server Moderator"
};

exports.help = {
    name: "prefix",
    description: "changes delet's prefix on the current server",
    category: "settings",
    usage: "prefix [prefix]"
};