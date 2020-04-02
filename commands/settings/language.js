const fetch = require("node-fetch");
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

    if (!newLanguage || newLanguage.toLowerCase() === "cancel") return message.channel.send(stripIndents`
        🚪 Ended the settings customisation procedure.`);

    if (!validLangs.includes(newLanguage)) return message.channel.send(stripIndents`
        "${newLanguage}" is either an invalid or unavailable language tag.
        Please use \`${message.settings.prefix}language available\` to see a list of valid languages.`);

    const secret = await client.genSecret();
    const url = `${process.env.URL}/guilds/${message.guild.id}`;
    const body = { "settings": { "language": newLanguage } };

    const meta = { "Content-Type": "application/json", "Authorization": `jwt ${secret.token}` };

    try {
        const res = await fetch(url, {
            method: "PUT",
            body: JSON.stringify(body),
            headers: meta
        });

        if (res.status === 200) return message.channel.send(`<:tick:688400118549970984> Language successfully changed to \`${newLanguage}\`.`);
    } catch (err) {
        message.channel.send("<:x_:688400118327672843> An error occurred whilst changing the language.");
        return client.logger.err(`Error changing language:\n${err.stack}`);
    }
};

exports.config = {
    aliases: ["lang", "locale"],
    enabled: true,
    guildOnly: true,
    permLevel: "Server Moderator"
};

exports.help = {
    name: "language",
    description: "changes delet's language on the current server",
    category: "settings",
    usage: "language [locale]"
};