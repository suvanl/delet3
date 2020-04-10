const { MessageEmbed } = require("discord.js");
const { stripIndents } = require("common-tags");

exports.run = async (client, message, args) => {
    // Get avatar by mentioning user
    let user = message.mentions.users.first() || message.author;
    let url = user.displayAvatarURL({ size: 1024 });
    let tag = user.tag;

    // Get avatar by providing GuildMember's username
    if (args[0] && !args[0].startsWith("<@!")) {
        user = member = message.guild.members.cache.find(m => m.user.username === args[0]);
        url = member.user.displayAvatarURL({ size: 1024 });
        tag = member.user.tag;
    }

    // Create and send embed
    const embed = new MessageEmbed()
        .setColor("#99AAB5")
        .setDescription(stripIndents`
            🖼️ **${client.l10n(message, "avatar.user").replace(/%user%/g, tag)}**
            🔗 **[${client.l10n(message, "avatar.url")}](${url})**`)
        .setImage(url);

    message.channel.send(embed);
};

exports.config = {
    aliases: [],
    enabled: true,
    guildOnly: false,
    permLevel: "User"
};

exports.help = {
    name: "avatar",
    description: "sends the specified user's avatar (or yours, if no one is specified)",
    category: "misc",
    usage: "avatar [username]"
};