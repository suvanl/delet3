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
        ${client.l10n(message, "mod.noUser.info")}
        ${client.l10n(message, "details").replace(/%cmd%/g, `${message.settings.prefix}help ban`)}`);

    // Guild members cache
    const cache = message.guild.members.cache;

    // User mention pattern
    const re = new RegExp(/<@!?(\d{17,19})>/g);

    // Define user: can be @mention or user ID
    const user = args[0].match(re) ? message.mentions.users.first() : (cache.find(m => m.id === args[0]) ? cache.find(m => m.id === args[0]).user : false);
    if (!user) return message.channel.send(stripIndents`
        ℹ **${client.l10n(message, "mod.invalidUser")}**
        ${client.l10n(message, "mod.invalidUser.info")}`);

    // Get user's GuildMember object
    const member = message.guild.member(user);

    // Check if member is bannable
    if (!member.bannable) return message.channel.send(client.l10n(message, "mod.ban.notBannable"));

    // Days of message history to delete
    let days = parseInt(args[1]);
    
    // Reason for the ban
    let reason = isNaN(days) ? args.slice(1).join(" ") : args.slice(2).join(" ");

    // If a reason isn't provided...
    if (!reason) {
        // Prompt for reason:
            // ℹ You're about to ban %user% without specifying a reason.
            // • Reply with `continue` to proceed, or with `cancel to exit`
            // • Alternatively, to provide a reason, simply enter it below:
        const msg = stripIndents`
            ℹ ${client.l10n(message, "mod.ban.noReason").replace(/%user%/g, `**${user.tag}**`)}

            • ${client.l10n(message, "prompt.continue")}
            • ${client.l10n(message, "prompt.enterReason")}`;

        reason = await client.awaitReply(message, msg);

        // Return if 60s is up, or if user replies with "cancel"
        if (!reason || reason.toLowerCase() === "cancel") return message.channel.send(`🚪 ${client.l10n(message, "mod.cancel")}`);

        // Set reason to null if user wishes to proceed without setting a reason
        if (reason.toLowerCase() === "continue") reason = null;
    }

    // Set days to 0 if unspecified
    if (!days) days = 0;

    // Cap days at 7
    if (days > 7) days = 7;

    // TODO: implement option to DM a message to ban target

    // Ban user, update case number and send confirmation message
    try {        
        const ban = await member.ban({ days, reason });
        await client.updateCaseNumber(message.guild);
        message.channel.send(`🔨 ${client.l10n(message, "mod.ban.inform").replace(/%user%/g, `**${ban.user.tag}**`)}`);
    } catch (err) {
        message.channel.send(`<:x_:688400118327672843> ${client.l10n(message, "error")}`);
        return client.logger.err(`error banning a user:\n${err.stack}`);
    }

    // If modLogEnabled is true and modLogData includes "kickBan"...
    if (message.settings.modLogEnabled && message.settings.modLogData.includes("kickBan")) {
        // Get case number
        const guildData = await client.getGuild(message.guild);
        const caseNum = guildData.caseNumber;

        // TODO: handle sending of the embed in guildBanAdd event?
        // then bans that aren't done using the bot can be logged too
        // though it might be harder to fetch the reason;
        // refer to audit log for reason info?

        // Embed footer data
        const issuedBy = client.l10n(message, "mod.embed.issued").replace(/%user%/g, message.author.tag);
        const caseNumber = client.l10n(message, "mod.embed.case").replace(/%num%/g, caseNum);

        // Create and send embed (to modLogChannel):
            // 🔨 Action: Ban
            // 👤 Member: %user%
            // #️⃣ User ID: %id%
            // ❔ Reason: %rsn%
            // Issued by %user% | Case %num%
        const embed = new MessageEmbed()
            .setColor("#f04747")
            .setThumbnail(user.displayAvatarURL())
            .setDescription(stripIndents`
                🔨 ${client.l10n(message, "mod.embed.action").replace(/%act%/g, `**${client.l10n(message, "ban.noun")}**`)}

                👤 ${client.l10n(message, "mod.embed.member").replace(/%user%/g, `**${user.tag}**`)}
                #️⃣ ${client.l10n(message, "mod.embed.userID").replace(/%id%/g, `**${user.id}**`)}
                ❔ ${client.l10n(message, "mod.embed.reason").replace(/%rsn%/g, `**${reason ? reason : client.l10n(message, "mod.ban.reason.null")}**`)}`)
            .setFooter(`${issuedBy} • ${caseNumber}`, message.author.displayAvatarURL());

        return modLog.send(embed);
    }
};

exports.config = {
    aliases: [],
    enabled: true,
    guildOnly: true,
    permLevel: "Server Moderator"
};

exports.help = {
    name: "ban",
    description: "bans the specified user",
    category: "moderation",
    usage: "ban <@user|user ID> [days of message history to delete] <reason>"
};