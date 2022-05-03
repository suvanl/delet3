import { stripIndents } from "common-tags";

export const run = async (client, message, args, level) => {
    client.sendDeprecationWarning(message, "use the `/level` slash command instead.");

    const lvlName = client.permLevels.levels.find(l => l.level === level).name;
    message.reply(stripIndents`
        ${client.l10n(message, "level.lvl").replace(/%lvl%/g, `\`${level}\` (**${lvlName}**)`)}
        ${client.l10n(message, "level.info").replace(/%cmd%/g, `\`${message.settings.prefix}help\``)}`);
};

export const config = {
    aliases: ["lvl", "mylevel", "permlevel"],
    enabled: true,
    guildOnly: true,
    permLevel: "User"
};

export const help = {
    name: "level",
    description: "shows your permission level on the current server",
    category: "misc",
    usage: "level"
};