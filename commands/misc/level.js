const { stripIndents } = require("common-tags");

exports.run = async (client, message, args, level) => {
    const lvlName = client.permLevels.levels.find(l => l.level === level).name;
    message.reply(stripIndents`
        ${client.l10n(message, "level.lvl").replace(/%lvl%/g, `\`${level}\` (**${lvlName}**)`)}
        ${client.l10n(message, "level.info").replace(/%cmd%/g, `\`${message.settings.prefix}help\``)}`);
};

exports.config = {
    aliases: ["mylevel", "permlevel"],
    enabled: true,
    guildOnly: true,
    permLevel: "User"
};

exports.help = {
    name: "level",
    description: "shows your permission level on the current server",
    category: "misc",
    usage: "level"
};