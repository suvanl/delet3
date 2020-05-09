const { MessageEmbed } = require("discord.js");
const { stripIndents } = require("common-tags");

exports.run = async (client, message, args) => {
    // Only run if message author has the BAN_MEMBERS permission
    if (!message.member.hasPermission("BAN_MEMBERS")) return message.channel.send(stripIndents`
        🚫 **Insufficient permissions**
        You must have the "Ban Members" permission to use this command.`);

    // If modLogEnabled is true, check if modLogChannel exists
    // This check should only fail if modLogChannel is left as default,
    // and if a channel with this default name doesn't exist in the guild
    let modLog;
    if (message.settings.modLogEnabled) {
        modLog = message.guild.channels.cache.find(c => c.name === message.settings.modLogChannel);
        if (!modLog) return message.channel.send(stripIndents`
            ⚠️ **Mod-log channel not found**
            Please use \`${message.settings.prefix}modlog\` to set it to a channel that exists on this server.`);
    }

    // Inform user if no args are specified and direct them towards help
    if (!args.length) return message.channel.send(stripIndents`
        ℹ **User not specified**
        You can specify a user by mentioning them, or by providing their user ID.
        Use \`${message.settings.prefix}help ban\` for further details.`);

    // Guild members cache
    const cache = message.guild.members.cache;

    // User mention pattern
    const re = new RegExp(/<@!?(\d{17,19})>/g);

    // Define user: can be @mention or user ID
    const user = args[0].match(re) ? message.mentions.users.first() : (cache.find(m => m.id === args[0]) ? cache.find(m => m.id === args[0]).user : false);
    if (!user) return message.channel.send(stripIndents`
        ℹ **User not found**
        Please ensure you've mentioned a user in this server or provided a valid user ID.`);

    // Get user's GuildMember object
    const member = message.guild.member(user);

    // Check if member is bannable
    if (!member.bannable) return message.channel.send("The specified user cannot be banned.");

    // Days of message history to delete
    let days = parseInt(args[1]);
    
    // Reason for the ban
    let reason = isNaN(days) ? args.slice(1).join(" ") : args.slice(2).join(" ");

    // If a reason isn't provided...
    if (!reason) {
        // Prompt for reason
        const msg = stripIndents`
            ℹ You're about to ban **${user.tag}** without specifying a reason.

            • Reply with \`continue\` to proceed, or with \`cancel\` to exit.
            • Alternatively, to provide a reason, simply enter it below:`;

        reason = await client.awaitReply(message, msg);

        // Return if 60s is up, or if user replies with "cancel"
        if (!reason || reason.toLowerCase() === "cancel") return message.channel.send("🚪 Ended the ban procedure.");

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
        message.channel.send(`🔨 **${ban.user.tag}** has been banned from the server.`);
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

        // Create and send embed
        const embed = new MessageEmbed()
            .setColor("#f04747")
            .setThumbnail(user.displayAvatarURL())
            .setDescription(stripIndents`
                🔨 Action: **Ban**

                👤 Member: **${user.tag}**
                ❔ Reason: **${reason ? reason : "No reason provided"}**`)
            .setFooter(`Issued by ${message.author.tag} • Case ${caseNum}`, message.author.displayAvatarURL());

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