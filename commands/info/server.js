const { utc } = require("moment");
const { MessageEmbed } = require("discord.js");
const { stripIndents } = require("common-tags");

exports.run = async (client, message) => {
    const guild = message.guild;

    // Whether to display verified icon or not
    const verified = guild.verified ? "" : "<:verified:703993007485091871>";

    // Text/voice channel numbers
    const tChannels = guild.channels.cache.filter(c => c.type === "text").size;
    const vChannels = guild.channels.cache.filter(c => c.type === "voice").size;

    // Number of bots in guild
    const bots = guild.members.cache.filter(m => m.user.bot).size;

    // Verification level names
    const vLevels = {
        "NONE": client.l10n(message, "server.verif.none"),
        "LOW": client.l10n(message, "server.verif.low"),
        "MEDIUM": client.l10n(message, "server.verif.medium"),
        "HIGH": "(╯°□°）╯︵ ┻━┻",
        "VERY_HIGH": "┻━┻ ﾐヽ(ಠ益ಠ)ノ彡┻━┻"
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
            **${guild.name}** ${verified} | <:server_boost:703991798015459390> Level **${guild.premiumTier}**

            💥 **Server created**
            ${utc(guild.createdTimestamp).format(`DD/MM/YYYY [${client.l10n(message, "user.time.at")}] HH:mm`)}

            💬 **Channels**
            ${tChannels} text • ${vChannels} voice (\`${guild.region}\`)

            👥 **Members**
            ${guild.memberCount - bots} users • ${bots} bots

            🔑 **Owner**
            ${guild.owner.user.tag}

            ✅ **Verification**
            Level: ${vLevels[guild.verificationLevel]}
            Content filter: ${cFilter[guild.explicitContentFilter]}
        `)
        .setFooter(`Server ID: ${guild.id} | ${client.l10n(message, "utc")}`);

    message.channel.send(embed);
};

exports.config = {
    aliases: ["serverinfo"],
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