import { MessageEmbed } from "discord.js";
import { stripIndents } from "common-tags";

export const run = async (client, message, args) => {
    // Get avatar by mentioning user
    const user = message.mentions.users.first() || message.author;
    let url = user.displayAvatarURL({ size: 1024 });
    let tag = user.tag;

    // Get avatar by providing GuildMember's username
    if (args[0] && !args[0].startsWith("<@")) {
        const member = message.guild.members.cache.find(m => m.user.username === args[0]);
        if (!member) return message.channel.send(client.l10n(message, "avatar.user.invalid"));
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

    message.channel.send({ embeds: [embed] });
};

export const config = {
    aliases: [],
    enabled: true,
    guildOnly: false,
    permLevel: "User"
};

export const help = {
    name: "avatar",
    description: "sends the specified user's avatar (or yours, if no one is specified)",
    category: "misc",
    usage: "avatar [username]"
};