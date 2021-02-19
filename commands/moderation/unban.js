const { MessageEmbed } = require("discord.js");
const { stripIndents } = require("common-tags");

exports.run = async (client, message, args) => {
    // Only run if message author has the BAN_MEMBERS permission
    // and inform user if they do not have the required perm:
        // 🚫 Insufficient permissions
        // You must have the "Ban Members" permission to use this command.
        if (!message.member.hasPermission("BAN_MEMBERS")) return message.channel.send(stripIndents`
        🚫 **${client.l10n(message, "perm.insufficient")}**
        ${client.l10n(message, "perm.insufficient.info").replace(/%perm%/g, client.l10n(message, "perm.banMembers"))}`);

    // If modLogEnabled is true, check if modLogChannel exists
    // This check should only fail if modLogChannel is left as default,
    // and if a channel with this default name doesn't exist in the guild
    let modLog;
    if (message.settings.modLogEnabled) {
        modLog = message.guild.channels.cache.find(c => c.name === message.settings.modLogChannel);
        // ⚠ Mod-log channel not found
        // Please use %modlog to set it to a channel that exists on this server.
        if (!modLog) return message.channel.send(stripIndents`
            ⚠️ **${client.l10n(message, "mod.noModLog")}**
            ${client.l10n(message, "mod.noModLog.info").replace(/%cmd%/g, `${message.settings.prefix}modlog`)}`);
    }

    // Inform user if no args are specified and direct them towards help:
        // ℹ User not specified
        // You can specify a user by mentioning them, or by providing their user ID.
        // Use %help ban for further details.
    if (!args.length) return message.channel.send(stripIndents`
        ℹ **${client.l10n(message, "mod.noUser")}**
        ${client.l10n(message, "mod.noUser.idOnly.info")}
        ${client.l10n(message, "details").replace(/%cmd%/g, `${message.settings.prefix}help unban`)}`);

    // ID to unban
    const id = args[0];

    // Reason for unbanning the specified member (optional)
    let reason = args.slice(1).join(" ");
    if (!reason) reason = "None";

    // Fetch bans
    const bans = await message.guild.fetchBans();

    // Check if a ban with the specified user ID exists in the collection
    if (bans.some(u => id === u.user.id)) {
        // Unban specified member from guild
        const unban = await message.guild.members.unban(id);

        // Get all active bans on this guild
        const guildData = await client.getGuild(message.guild);
        const dbBans = guildData.activePunishments["bans"];

        // Check if a ban with the specified user ID exists within the "bans" array, by checking if it returns a valid index.
        // The Array.prototype.findIndex() function returns -1 if an index cannot be found.
        if (dbBans.findIndex(obj => obj.userID === id) !== -1) {
            // If a ban does exist, remove it
            await client.removePunishment("bans", message.guild, "337216913585209345");
        }

        // Inform user that the member was unbanned successfully
        message.channel.send(`<:tick:688400118549970984> **${unban.tag}** (${unban.id}) was successfully unbanned.`);

        // If modLogEnabled is true and modLogData includes "kickBan", create an embed
        if (message.settings.modLogEnabled && message.settings.modLogData.includes("kickBan")) {
            const embed = new MessageEmbed()
                .setColor("#5fa9f2")
                .setThumbnail(unban.displayAvatarURL())
                .setDescription(stripIndents`
                    ↩️ Action: **Unban**

                    👤 Member: **${unban.tag}**
                    #️⃣ User ID: **${unban.id}**
                    ❔ Reason: **${reason}**`)
                .setFooter(client.l10n(message, "mod.embed.issued").replace(/%user%/g, message.author.tag), message.author.displayAvatarURL());

            // Send embed
            return modLog.send(embed);
        }
    } else { 
        // Else, inform the user that the user could not be found in the collection
        return message.channel.send("An invalid user ID was provided. Perhaps this user isn't banned?");
    }
};

exports.config = {
    aliases: [],
    enabled: true,
    guildOnly: true,
    permLevel: "Server Moderator"
};

exports.help = {
    name: "unban",
    description: "unbans the specified user",
    category: "moderation",
    usage: "unban <userID> [reason]"
};