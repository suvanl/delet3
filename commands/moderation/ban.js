import { DateTime } from "luxon";
import { EmbedBuilder } from "discord.js";
import { stripIndents } from "common-tags";

export const run = async (client, message, args) => {
    // Only run if message author has the BAN_MEMBERS permission
    // and inform user if they do not have the required perm:
        // 🚫 Insufficient permissions
        // You must have the "Ban Members" permission to use this command.
    if (!message.member.permissions.has("BAN_MEMBERS")) return message.channel.send(stripIndents`
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
    const member = message.guild.members.cache.get(user.id);

    // Check if member is bannable
    if (!member.bannable) return message.channel.send(client.l10n(message, "mod.ban.notBannable"));

    // Days of message history to delete (final arg)
    // let days = parseInt(args[args.length - 1]);

    // Ban duration (seconds)
    const durationValues = {
        "a": 3600,  // 1h
        "b": 86400, // 1d
        "c": 604800 // 7d
    };

    // Set duration as args[1] value
    let duration = args[1];

    // RegExp to match duration format (e.g. 5h, 7d)
    const durationRe = /\b((\d+(\.\d+)?)(h|hr|hrs?|hours?|d|days?))?\b/g;

    // Define invalid duration/value format message:
    //  ❌ Invalid duration value/format
    //  The valid duration format is: \`X<hours/days>\`, e.g. \`5hours\` or \`7days\`.
    const invalidFormatMsg = stripIndents`
        ❌ **${client.l10n(message, "mod.ban.duration.invalid")}**
        ${client.l10n(message, "mod.ban.duration.format")}`;
    
    // If duration argument (args[1]) is given in an invalid format:
    //  NOTE: The following check works as <String>.match(RegExp) returns an array of matches.
    //        If the first item in the array is an empty string, this would mean the duration string
    //        does not match the regular expression. For some reason, the returned array has two empty
    //        strings in cases where an invalid duration value is provided. Surely it should return an
    //        empty array instead, right? I'm guessing this happens due to the nature of the RegExp.
    if (duration && duration.toString().match(durationRe)[0] === "") return message.channel.send(invalidFormatMsg);

    if (duration) duration = await durationToSeconds(duration.toString().toLowerCase());

    // If duration isn't specified
    if (!duration) {
        // Define prompt message:
            // ℹ No duration specified
            //
            // • If no duration is specified, the ban will be permanent.
            // • Would you like to specify a duration? [y/n]
            // • Reply with cancel to exit
        const msg = stripIndents`
            ℹ **${client.l10n(message, "mod.ban.duration.null")}**

            • ${client.l10n(message, "mod.ban.duration.null.info")}
            • ${client.l10n(message, "mod.ban.duration.null.request")} [\`y\`/\`n\`]
            • ${client.l10n(message, "mod.exitInfo")}`;

        // Define response as an awaited reply
        const response = await client.awaitReply(message, msg);

        // If no response, or if the response is "cancel", inform the user and return
        if (!response || response.toLowerCase() === "cancel") return message.channel.send(`🚪 ${client.l10n(message, "mod.cancel")}`);

        // If the user doesn't want to specify a duration, make the ban permanent
        if (response.toLowerCase() === "n") duration = 3153600000;  // ~100 years

        // If they do wish to specify a response...
        if (response.toLowerCase() === "y") {
            // Define prompt message:
                // ℹ How long would you like to ban **%usr%** for?
                //
                // 🇦: 1 hour
                // 🇧: 1 day
                // 🇨: 7 days
                //
                // • Alternatively, reply with a custom duration.
                // • Reply with `cancel` to exit.
            const msg = stripIndents`
                ℹ ${client.l10n(message, "mod.ban.durationPrompt").replace(/%usr%/g, user.tag)}

                🇦: ${client.l10n(message, "mod.ban.durationPrompt.a")}
                🇧: ${client.l10n(message, "mod.ban.durationPrompt.b")}
                🇨: ${client.l10n(message, "mod.ban.durationPrompt.c")}
                
                • ${client.l10n(message, "mod.ban.durationPrompt.alt")}
                • ${client.l10n(message, "mod.exitInfo")}`;

            // Define valid responses (other than a custom value)
            const validLetters = ["a", "b", "c"];

            // Await the response + store in the `response` variable
            const response = await client.awaitReply(message, msg);
            const lwr = response.toLowerCase();

            // If duration format is invalid, inform user and return
            if (!lwr.match(durationRe)) return message.channel.send(invalidFormatMsg);

            // If no response, or if the response is "cancel", inform the user and return
            if (!response || response.toLowerCase() === "cancel") return message.channel.send(`🚪 ${client.l10n(message, "mod.cancel")}`);

            // If the user has replied with a valid letter (A, B or C), set the duration value appropriately, using the durationValues object
            if (validLetters.includes(lwr)) duration = durationValues[lwr];

            // Else, if the user hasn't replied with a valid letter BUT has specified a valid duration (based on the durationRe RegExp),
            // Convert the value they've provided to a number of seconds
            else if (!validLetters.includes(lwr) && lwr.match(durationRe)) await durationToSeconds(lwr);
        }
    }
    
    // Reason for the ban
    let reason = args.slice(2).join(" ");

    // If a reason isn't provided...
    if (!reason) {
        // Prompt for reason:
            // ℹ You're about to ban %user% without specifying a reason.
            // • Reply with `continue` to proceed, or with `cancel` to exit
            // • Alternatively, to provide a reason, simply enter it below:
        const msg = stripIndents`
            ℹ ${client.l10n(message, "mod.ban.noReason").replace(/%user%/g, `**${user.tag}**`)}

            • ${client.l10n(message, "prompt.continue")}
            • ${client.l10n(message, "prompt.enterReason")}`;

        reason = await client.awaitReply(message, msg);

        // Set reason as "None" if the user states they wish to continue without providing a reason
        if (reason.toLowerCase() === "continue") reason = "None";

        // Return if 60s is up, or if user replies with "cancel"
        if (!reason || reason.toLowerCase() === "cancel") return message.channel.send(`🚪 ${client.l10n(message, "mod.cancel")}`);

        // Set reason to null if user wishes to proceed without setting a reason
        if (reason.toLowerCase() === "continue") reason = null;
    }

    // TODO: implement option to DM a message to ban target

    // Handle ban process
    try {      
        // Ban user from guild  
        const ban = await member.ban({ reason });

        // Store punishment details in database (type, userID, issuerID, reason, issuedTimestamp, endTimestamp)
        await client.addPunishment("bans", message.guild, member.id, message.author.id, reason, duration);

        // Update punishment case number
        await client.updateCaseNumber(message.guild);

        // Send confirmation message, saying that the user was successfully banned
        message.channel.send(`🔨 ${client.l10n(message, "mod.ban.inform").replace(/%user%/g, `**${ban.user.tag}**`)}`);
    } catch (err) {
        message.channel.send(`<:x_:688400118327672843> ${client.l10n(message, "error")}`);
        return client.logger.error(`error banning a user:\n${err.stack}`);
    }

    // If modLogEnabled is true and modLogData includes "kickBan"...
    if (message.settings.modLogEnabled && message.settings.modLogData.includes("kickBan")) {
        // Get case number
        const guildData = await client.getGuild(message.guild);
        const caseNum = guildData.caseNumber;

        // TODO: handle sending of the embed in guildBanAdd event?
        // This way, bans that aren't done using the bot can be logged too.
        // However, this may make it harder to fetch the reason.
        // Fetch reason from audit log?

        // Embed footer data
        const issuedBy = client.l10n(message, "mod.embed.issued").replace(/%user%/g, message.author.tag);
        const caseNumber = client.l10n(message, "mod.embed.case").replace(/%num%/g, caseNum);

        // Generate ban expiry timestamp
        const expiry = DateTime.now().plus({ seconds: duration }).toUTC().toUnixInteger();

        // Create and send embed (to modLogChannel):
            // 🔨 Action: Ban
            // 👤 Member: %user%
            // #️⃣ User ID: %id%
            // ⌛ Duration: %dur%
            // ❔ Reason: %rsn%
            // Issued by %user% | Case %num%
        const embed = new EmbedBuilder()
            .setColor("#f04747")
            .setThumbnail(user.displayAvatarURL())
            .setDescription(stripIndents`
                🔨 ${client.l10n(message, "mod.embed.action").replace(/%act%/g, `**${client.l10n(message, "ban.noun")}**`)}

                👤 ${client.l10n(message, "mod.embed.member").replace(/%user%/g, `**${user.tag}**`)}
                #️⃣ ${client.l10n(message, "mod.embed.userID").replace(/%id%/g, `**${user.id}**`)}
                ⌛ ${client.l10n(message, "mod.embed.duration").replace(/%dur%/g, `**<t:${expiry}:R>**`)}
                ❔ ${client.l10n(message, "mod.embed.reason").replace(/%rsn%/g, `**${reason ? reason : client.l10n(message, "mod.ban.reason.null")}**`)}`)
            .setFooter({ text: `${issuedBy} • ${caseNumber}`, iconURL: message.author.displayAvatarURL() });

        return modLog.send({ embeds: [embed] });
    }
};

// Converts a duration string to time in seconds, which will be passed to the addPunishment core function
const durationToSeconds = async lowerCaseStr => {
    // extract numbers from string
    // h = 3600s
    // d = 86400s
    // do: <number> * <d|h>
    // e.g. if custom value is 6d, do: 6 * d
    //                               = 6 * 86400
    // which gives us the duration in seconds

    // Hour/day RegExps
    const hourRe = /\b((\d+(\.\d+)?)(h|hr|hrs?|hours?))?\b/g;
    const dayRe = /\b((\d+(\.\d+)?)(d|day?|days?))?\b/g;

    // Set number of seconds in each time unit
    let seconds;
    if (lowerCaseStr.match(hourRe)[0] !== "") seconds = 3600;
    if (lowerCaseStr.match(dayRe)[0] !== "") seconds = 86400;

    // Extract numbers from string
    const numbers = lowerCaseStr.match(/\d+/g).map(Number);

    // Number * <hour/day> = duration (seconds)
    const duration = numbers[0] * seconds;
    return duration;
};

export const config = {
    aliases: [],
    enabled: true,
    guildOnly: true,
    permLevel: "Server Moderator"
};

export const help = {
    name: "ban",
    description: "bans the specified user",
    category: "moderation",
    usage: "ban <@user|userID> [duration] [reason]"
};