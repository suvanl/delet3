const { stripIndents } = require("common-tags");
const { langName, validLangs } = require("../../core/util/data");

exports.run = async (client, message, args) => {
    const msg = stripIndents`
        ⚙️ The current language is **${langName[message.settings.language]}** (\`${message.settings.language}\`).
        📖 Use \`${message.settings.prefix}language available\` to see a list of valid languages (with tags).
        🔄 Please enter the new language tag. Reply with \`cancel\` to exit.`;

    if (args[0] && args[0].toLowerCase() === "available") return message.channel.send(stripIndents`
        🌍 **Available languages**

        ${validLangs.map(l => `**-** ${langName[l]} (\`${l}\`)`).join("\n")}`);

    const newLanguage = args[0] || await client.awaitReply(message, msg);

    if (!newLanguage || newLanguage.toLowerCase() === "cancel") return message.channel.send(`🚪 ${client.l10n(message, "settings.cancel")}`);

    if (!validLangs.includes(newLanguage)) return message.channel.send(stripIndents`
        "${newLanguage}" is either an invalid or unavailable language tag.
        Please use \`${message.settings.prefix}language available\` to see a list of valid languages.`);

    try {
        const update = await client.updateSettings(message.guild, "language", newLanguage);
        if (update === 200) return message.channel.send(`<:tick:688400118549970984> Language successfully changed to \`${newLanguage}\`.`);
    } catch (err) {
        message.channel.send(`<:x_:688400118327672843> ${client.l10n(message, "settings.error")}`);
        return client.logger.err(`Error changing language:\n${err.stack}`);
    }
};

exports.config = {
    aliases: ["lang", "locale"],
    enabled: true,
    guildOnly: true,
    permLevel: "Server Admin"
};

exports.help = {
    name: "language",
    description: "changes delet's language on the current server",
    category: "settings",
    usage: "language [locale]"
};