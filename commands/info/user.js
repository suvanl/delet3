const { utc } = require("moment");
const { MessageEmbed } = require("discord.js");
const { stripIndents } = require("common-tags");
const { badge, statusIcon } = require("../../core/util/data");

exports.run = async (client, message) => {
    // Get user by mention (fallback: self)
    // TODO: ability to get user by username as well
    const user = message.mentions.users.first() || message.author;
    
    // Flags
    const fetchFlags = await user.fetchFlags();
    const userFlags = fetchFlags.toArray();

    // Badges
    let badges = userFlags.map(f => `<:${f.toLowerCase()}:${badge[f.toLowerCase()]}>`);
    if (badges.length === 0 && user.bot) badges = "<:bot:703336283577122826>";

    // Status
    const status = {
        "online": client.l10n(message, "user.status.online"),
        "idle": client.l10n(message, "user.status.idle"),
        "dnd": client.l10n(message, "user.status.dnd"),
        "offline": client.l10n(message, "user.status.offline")
    };

    const statusEmoji = `<:${user.presence.status}:${statusIcon[user.presence.status]}>`;

    // Activity
    let activity = "";
    const friendlyActivity = {
        "PLAYING": client.l10n(message, "user.activity.playing"),
        "STREAMING": client.l10n(message, "user.activity.streaming"),
        "LISTENING": client.l10n(message, "user.activity.listening"),
        "WATCHING": client.l10n(message, "user.activity.watching")
    };

    // Get the user's current activity
    const currentActivity = user.presence.activities[0];

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
    const data = await client.getUser(message.guild, user);

    // ROLES:
    // Get the user's roles (as a collection containing a Map per role)
    const userRoles = message.guild.member(user).roles.cache;
    
    // Surround every role's name with backticks, resulting in single-line code formatting for each one
    const formattedRoles = userRoles.map(r => `\`${r.name}\``);

    // Remove @everyone from the array of roles
    let roles = formattedRoles.filter(r => r !== "`@everyone`");

    // Get the user's highest role
    const highestRole = message.guild.member(user).roles.highest.name;

    // Move the user's highest role to the start of the array of roles
    roles = moveElementToStart(roles, `\`${highestRole}\``);

    // If the user has no roles, display "None"
    if (roles.length === 0) roles = ["None"];

    // Create and send embed
    const embed = new MessageEmbed()
        .setColor("#8cfed9")
        .setThumbnail(user.displayAvatarURL({ size: 1024 }))
        .setDescription(stripIndents`
            **${user.tag}** ${badges} | ${statusEmoji} ${user.presence.activities.length === 0 ? status[user.presence.status].toTitleCase() : activity}

            💥 **${client.l10n(message, "user.created")}**
            ${utc(user.createdTimestamp).format(`DD/MM/YYYY [${client.l10n(message, "user.time.at")}] HH:mm`)}

            🏠 **${client.l10n(message, "user.joined")}**
            ${utc(message.guild.member(user).joinedTimestamp).format(`DD/MM/YYYY [${client.l10n(message, "user.time.at")}] HH:mm`)}

            🧮 **${client.l10n(message, "points").toTitleCase()}**
            Trivia: ${data.triviaPoints} • ${client.l10n(message, "user.points.regular")}: ${data.points}

            📋 **${client.l10n(message, "user.roles")}**
            ${roles.slice(0, 3).join(", ")} ${roles.length >= 4 ? client.l10n(message, "user.roles.more").replace(/%num%/g, roles.length - 3) : ""}`)
        .setFooter(`${client.l10n(message, "user.id")}: ${user.id} | ${client.l10n(message, "utc")}`);
    
    message.channel.send(embed);
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