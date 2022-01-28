const { utc } = require("moment");
const { MessageEmbed } = require("discord.js");
const { stripIndents } = require("common-tags");

exports.run = async (client, message) => {
    const guild = message.guild;

    // Whether to display verified icon or not
    const verified = guild.verified ? "<:verified:703993007485091871>" : "";

    // Text/voice channel numbers
    const tChannels = guild.channels.cache.filter(c => c.type === "GUILD_TEXT").size;
    const vChannels = guild.channels.cache.filter(c => c.type === "GUILD_VOICE").size;

    // Number of bots in guild
    const bots = guild.members.cache.filter(m => m.user.bot).size;

    // Verification level names
    const vLevels = {
        "NONE": client.l10n(message, "server.verif.none"),
        "LOW": client.l10n(message, "server.verif.low"),
        "MEDIUM": client.l10n(message, "server.verif.medium"),
        "HIGH": client.l10n(message, "server.verif.high"),
        "VERY_HIGH": client.l10n(message, "server.verif.veryHigh")
    };

    // Content filter names
    const cFilter = {
        "DISABLED": client.l10n(message, "server.cFilter.disabled"),
        "MEMBERS_WITHOUT_ROLES": client.l10n(message, "server.cFilter.noRole"),
        "ALL_MEMBERS": client.l10n(message, "server.cFilter.all")
    };

    // Create and send embed
    const embed = new MessageEmbed()
        .setColor("#fed98c")
        .setThumbnail(guild.iconURL({ size: 1024 }))
        .setDescription(stripIndents`
            **${guild.name}** ${verified} | <:server_boost:703991798015459390> ${client.l10n(message, "server.boost.lvl").replace(/%num%/g, guild.premiumTier === "NONE" ? 0 : guild.premiumTier.split("_")[1])}

            💥 **${client.l10n(message, "server.created")}**
            ${utc(guild.createdTimestamp).format(`DD/MM/YYYY [${client.l10n(message, "user.time.at")}] HH:mm`)}

            💬 **${client.l10n(message, "server.channels")}**
            ${client.l10n(message, "server.channels.txt").replace(/%num%/g, tChannels)} • ${client.l10n(message, "server.channels.voice").replace(/%num%/g, vChannels)}

            👥 **${client.l10n(message, "server.members")}**
            ${client.l10n(message, "server.users").replace(/%num%/g, guild.memberCount - bots)} • ${client.l10n(message, "server.bots").replace(/%num%/g, bots)}

            🔑 **${client.l10n(message, "server.owner")}**
            ${client.users.cache.get(message.guild.ownerId).tag}

            ✅ **${client.l10n(message, "server.verif")}**
            ${client.l10n(message, "server.verif.lvl")} ${vLevels[guild.verificationLevel]}
            ${client.l10n(message, "server.cFilter.lvl")} ${cFilter[guild.explicitContentFilter]}`)
        .setFooter({ text: `${client.l10n(message, "server.id").replace(/%id%/g, guild.id)} | ${client.l10n(message, "utc")}` });

    message.channel.send({ embeds: [embed] });
};

exports.config = {
    aliases: ["serverinfo", "guild", "guildinfo"],
    enabled: true,
    guildOnly: true,
    permLevel: "User"
};

exports.help = {
    name: "server",
    description: "sends info about the current server",
    category: "info",
    usage: "server"
};