const { utc } = require("moment");
const { MessageEmbed } = require("discord.js");
const { stripIndents } = require("common-tags");
const { badge, statusIcon } = require("../../core/util/data");

exports.run = async (client, message, args) => {
    // Set user as message author by default
    let member = message.member;

    let user = client.users.cache.get(member.id);

    // If message contains any mentioned users, set the user as the first mention
    if (message.mentions.users.first()) {
        user = message.mentions.users.first();
        member = message.guild.members.cache.get(user.id);
    }
    
    // If args have been supplied but no mentions are present, we'll assume the user is trying to reference a user by
    // their username. Therefore, we'll attempt to find a user in this server that has a username matching the value
    // of the first provided argument.
    if (args[0] && !message.mentions.users.first()) member = message.guild.members.cache.find(user => user.username == args[0]);

    // If a user with the specified username cannot be found in the current server, inform the user of this.
    if (!member) return message.channel.send(client.l10n(message, "avatar.user.invalid"));

    
    // Fetch user flags and convert them to an array of bitfield names
    const fetchFlags = await user.fetchFlags();
    const userFlags = fetchFlags.toArray();

    // Convert user flags to emojis corresponding to profile badges. These will be displayed on the profile embed.
    let badges = userFlags.map(f => `<:${f.toLowerCase()}:${badge[f.toLowerCase()]}>`);
    // If the user is a bot, display the appropriate "Bot" badge
    if (badges.length === 0 && member.bot) badges = "<:bot:703336283577122826>";

    // Translate status names to the current server's language
    const status = {
        "online": client.l10n(message, "user.status.online"),
        "idle": client.l10n(message, "user.status.idle"),
        "dnd": client.l10n(message, "user.status.dnd"),
        "offline": client.l10n(message, "user.status.offline")
    };

    // Define the status emoji that will be shown in the profile embed (in the format <:emojiName:emojiID>)
    const presenceStatus = member.presence ? member.presence.status : "offline";
    const statusEmoji = `<:${presenceStatus}:${statusIcon[presenceStatus]}>`;

    // Activity
    let activity = "";

    // Convert the current activity type to a user-friendly, localised string
    // (e.g. "Playing [Activity]", "Listening to [Activity]", etc)
    const friendlyActivity = {
        "PLAYING": client.l10n(message, "user.activity.playing"),
        "STREAMING": client.l10n(message, "user.activity.streaming"),
        "LISTENING": client.l10n(message, "user.activity.listening"),
        "WATCHING": client.l10n(message, "user.activity.watching")
    };

    // Get the user's current activity
    const currentActivity = member.presence?.activities[0];

    // If user has a current activity
    if (currentActivity) {
        if (currentActivity.type === "CUSTOM_STATUS") {
            // display their activity in the following format: [Emoji (if present)] [Status Message (if present)]
            activity = `${currentActivity.emoji ? currentActivity.emoji : "\u200b"} **${currentActivity.state ? currentActivity.state.truncate(24) : currentActivity.name}**`;
        } else {
            // if their status isn't a custom status, display their current activity (e.g. Listening to Spotify)
            activity = friendlyActivity[currentActivity.type].replace(/%activity%/g, `**${currentActivity.name}**`);
        }
    }

    // User data for points
    const data = await client.getUser(message.guild, member);

    // ROLES:
    // Get the user's roles (as a collection containing a Map per role)
    const userRoles = message.guild.members.cache.get(member.id).roles.cache;
    
    // Surround every role's name with backticks, resulting in single-line code formatting for each one
    const formattedRoles = userRoles.map(r => `\`${r.name}\``);

    // Remove @everyone from the array of roles
    let roles = formattedRoles.filter(r => r !== "`@everyone`");

    // Get the user's highest role
    const highestRole = message.guild.members.cache.get(member.id).roles.highest.name;

    // Move the user's highest role to the start of the array of roles
    roles = moveElementToStart(roles, `\`${highestRole}\``);

    // If the user has no roles, display "None"
    if (roles.length === 0) roles = ["None"];

    // Create and send embed
    const embed = new MessageEmbed()
        .setColor("#8cfed9")
        .setThumbnail(user.displayAvatarURL({ size: 1024 }))
        .setDescription(stripIndents`
            **${user.tag}** ${badges} | ${statusEmoji} ${member.presence?.activities.length === 0 ? status[member.presence.status].toTitleCase() : activity}

            💥 **${client.l10n(message, "user.created")}**
            <t:${utc(user.createdTimestamp).unix()}>

            🏠 **${client.l10n(message, "user.joined")}**
            <t:${utc(message.guild.members.cache.get(member.id).joinedTimestamp).unix()}>

            🧮 **${client.l10n(message, "points").toTitleCase()}**
            Trivia: ${data.triviaPoints} • ${client.l10n(message, "user.points.regular")}: ${data.points}

            📋 **${client.l10n(message, "user.roles")}**
            ${roles.slice(0, 3).join(", ")} ${roles.length >= 4 ? client.l10n(message, "user.roles.more").replace(/%num%/g, roles.length - 3) : ""}`)
        .setFooter(`${client.l10n(message, "user.id")}: ${member.id}`);
    
    message.channel.send({ embeds: [embed] });
};

// Function to move an element to the start of an array
moveElementToStart = (array, element) => {
    // Remove the element from the array
    array = array.filter(f => f !== element);

    // Use Array.prototype.unshift() to insert the element at the start of the array
    array.unshift(element);

    // Return the modified array
    return array;
};

exports.config = {
    aliases: ["userinfo"],
    enabled: true,
    guildOnly: false,
    permLevel: "User"
};

exports.help = {
    name: "user",
    description: "sends info about a user's account",
    category: "info",
    usage: "user [user]"
};