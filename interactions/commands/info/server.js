import { DateTime } from "luxon";
import { ChannelType, EmbedBuilder, GuildExplicitContentFilter, GuildVerificationLevel } from "discord.js";
import { stripIndents } from "common-tags";

export const run = async (client, interaction) => {
    const guild = interaction.guild;

    // Whether to display verified icon or not
    const verified = guild.verified ? "<:verified:703993007485091871>" : "";

    // Text/voice channel numbers
    const tChannels = guild.channels.cache.filter(c => c.type === ChannelType.GuildText).size;
    const vChannels = guild.channels.cache.filter(c => c.type === ChannelType.GuildVoice).size;

    // Number of bots in guild
    const bots = guild.members.cache.filter(m => m.user.bot).size;

    // Localised verification level names
    const vLevels = {
        [GuildVerificationLevel.None]: client.l10n(interaction, "server.verif.none"),
        [GuildVerificationLevel.Low]: client.l10n(interaction, "server.verif.low"),
        [GuildVerificationLevel.Medium]: client.l10n(interaction, "server.verif.medium"),
        [GuildVerificationLevel.High]: client.l10n(interaction, "server.verif.high"),
        [GuildVerificationLevel.VeryHigh]: client.l10n(interaction, "server.verif.veryHigh")
    };

    // Localised content filter level names
    const cFilter = {
        [GuildExplicitContentFilter.Disabled]: client.l10n(interaction, "server.cFilter.disabled"),
        [GuildExplicitContentFilter.MembersWithoutRoles]: client.l10n(interaction, "server.cFilter.noRole"),
        [GuildExplicitContentFilter.AllMembers]: client.l10n(interaction, "server.cFilter.all")
    };

    // Create and send embed
    const embed = new EmbedBuilder()
        .setColor("#fed98c")
        .setThumbnail(guild.iconURL({ size: 1024 }))
        .setDescription(stripIndents`
            **${guild.name}** ${verified} <:server_boost:703991798015459390> ${client.l10n(interaction, "server.boost.lvl").replace(/%num%/g, guild.premiumTier)}

            💥 **${client.l10n(interaction, "server.created")}**
            <t:${DateTime.fromJSDate(guild.createdAt).toUTC().toUnixInteger()}:R>

            💬 **${client.l10n(interaction, "server.channels")}**
            ${client.l10n(interaction, "server.channels.txt").replace(/%num%/g, tChannels)} • ${client.l10n(interaction, "server.channels.voice").replace(/%num%/g, vChannels)}

            👥 **${client.l10n(interaction, "server.members")}**
            ${client.l10n(interaction, "server.users").replace(/%num%/g, guild.memberCount - bots)} • ${client.l10n(interaction, "server.bots").replace(/%num%/g, bots)}

            👑 **${client.l10n(interaction, "server.owner")}**
            ${client.users.cache.get(guild.ownerId).tag}

            ✅ **${client.l10n(interaction, "server.verif")}**
            ${client.l10n(interaction, "server.verif.lvl")} ${vLevels[guild.verificationLevel]}
            ${client.l10n(interaction, "server.cFilter.lvl")} ${cFilter[guild.explicitContentFilter]}`)
        .setFooter({ text: `${client.l10n(interaction, "server.id").replace(/%id%/g, guild.id)} | ${client.l10n(interaction, "utc")}` });

    interaction.reply({ embeds: [embed], ephemeral: true });
};

export const data = {
    name: "server",
    description: "Sends info about this server",
    options: [],
    dm_permission: false
};

export const global = true;
