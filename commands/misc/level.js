exports.run = async (client, message, args, level) => {
    const lvlName = client.permLevels.levels.find(l => l.level === level).name;
    const settings = await client.getSettings(message.guild);

    message.reply(`your permission level is: \`${level}\` (**${lvlName}**).\nUse \`${settings.prefix}help\` to see a list of commands available to your level.`);
};

exports.config = {
    aliases: ["mylevel", "permlevel"],
    enabled: true,
    guildOnly: true,
    permLevel: "User"
};

exports.help = {
    name: "level",
    description: "Shows your permission level on the current server.",
    category: "Misc",
    usage: "level"
};