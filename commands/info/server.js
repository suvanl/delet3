import { DateTime } from "luxon";
import { ChannelType, EmbedBuilder } from "discord.js";
import { stripIndents } from "common-tags";

export const run = async (client, message) => {
    const guild = message.guild;

    // Whether to display verified icon or not
    const verified = guild.verified ? "<:verified:703993007485091871>" : "";

    // Text/voice channel numbers
    const tChannels = guild.channels.cache.filter(c => c.type === ChannelType.GuildText).size;
    const vChannels = guild.channels.cache.filter(c => c.type === ChannelType.GuildVoice).size;

    // Number of bots in guild
    const bots = guild.members.cache.filter(m => m.user.bot).size;

    // Localised verification level names
    const vLevels = {
        "NONE": client.l10n(message, "server.verif.none"),
        "LOW": client.l10n(message, "server.verif.low"),
        "MEDIUM": client.l10n(message, "server.verif.medium"),
        "HIGH": client.l10n(message, "server.verif.high"),
        "VERY_HIGH": client.l10n(message, "server.verif.veryHigh")
    };

    // Localised content filter level names
    const cFilter = {
        "DISABLED": client.l10n(message, "server.cFilter.disabled"),
        "MEMBERS_WITHOUT_ROLES": client.l10n(message, "server.cFilter.noRole"),
        "ALL_MEMBERS": client.l10n(message, "server.cFilter.all")
    };

    // Create and send embed
    const embed = new EmbedBuilder()
        .setColor("#fed98c")
        .setThumbnail(guild.iconURL({ size: 1024 }))
        .setDescription(stripIndents`
            **${guild.name}** ${verified} <:server_boost:703991798015459390> ${client.l10n(message, "server.boost.lvl").replace(/%num%/g, guild.premiumTier)}

            💥 **${client.l10n(message, "server.created")}**
            <t:${DateTime.fromJSDate(guild.createdAt).toUTC().toUnixInteger()}:R>

            💬 **${client.l10n(message, "server.channels")}**
            ${client.l10n(message, "server.channels.txt").replace(/%num%/g, tChannels)} • ${client.l10n(message, "server.channels.voice").replace(/%num%/g, vChannels)}

            👥 **${client.l10n(message, "server.members")}**
            ${client.l10n(message, "server.users").replace(/%num%/g, guild.memberCount - bots)} • ${client.l10n(message, "server.bots").replace(/%num%/g, bots)}

            👑 **${client.l10n(message, "server.owner")}**
            ${client.users.cache.get(message.guild.ownerId).tag}

            ✅ **${client.l10n(message, "server.verif")}**
            ${client.l10n(message, "server.verif.lvl")} ${vLevels[guild.verificationLevel]}
            ${client.l10n(message, "server.cFilter.lvl")} ${cFilter[guild.explicitContentFilter]}`)
        .setFooter({ text: `${client.l10n(message, "server.id").replace(/%id%/g, guild.id)} | ${client.l10n(message, "utc")}` });

    message.reply({ embeds: [embed], ephemeral: true });
};

export const config = {
    aliases: ["serverinfo", "guild", "guildinfo"],
    enabled: true,
    guildOnly: true,
    permLevel: "User"
};

export const help = {
    name: "server",
    description: "sends info about the current server",
    category: "info",
    usage: "server"
};