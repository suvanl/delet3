exports.run = async (client, message, args, level) => {
    const lvlName = client.permLevels.levels.find(l => l.level === level).name;
    message.reply(`your permission level is: \`${level}\` (**${lvlName}**).`);
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