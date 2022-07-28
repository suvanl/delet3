import { DateTime } from "luxon";
import { EmbedBuilder } from "discord.js";
import { stripIndents } from "common-tags";
import { badge, statusIcon } from "../../core/util/data";

// Moves an element to the start of an array
const moveElementToStart = (array, element) => {
    // Remove the element from the array
    array = array.filter(f => f !== element);

    // Use Array.prototype.unshift() to insert the element at the start of the array
    array.unshift(element);

    // Return the modified array
    return array;
};

export const run = async (client, interaction) => {
    const member = interaction.guild.members.cache.get(interaction.targetId);
    const user = member.user;
    
    // Fetch user flags and convert them to an array of bitfield names
    const fetchFlags = await user.fetchFlags();
    const userFlags = fetchFlags.toArray();

    // Convert user flags to emojis corresponding to profile badges. These will be displayed on the profile embed.
    let badges = userFlags.map(f => `<:${f.toLowerCase()}:${badge[f.toLowerCase()]}>`);

    // If the user is a bot, display the appropriate "Bot" badge
    if (badges.length === 0 && user.bot) badges = "<:bot:703336283577122826>";

    // Translate status names to the current server's language
    const status = {
        "online": client.l10n(interaction, "user.status.online"),
        "idle": client.l10n(interaction, "user.status.idle"),
        "dnd": client.l10n(interaction, "user.status.dnd"),
        "offline": client.l10n(interaction, "user.status.offline")
    };

    // Define the status emoji that will be shown in the profile embed (in the format <:emojiName:emojiID>)
    const presenceStatus = member.presence ? member.presence.status : "offline";
    const statusEmoji = `<:${presenceStatus}:${statusIcon[presenceStatus]}>`;
    
    // Activity
    let activity = "";

    // Convert the current activity type to a user-friendly, localised string
    // (e.g. "Playing [Activity]", "Listening to [Activity]", etc)
    const friendlyActivity = {
        "PLAYING": client.l10n(interaction, "user.activity.playing"),
        "STREAMING": client.l10n(interaction, "user.activity.streaming"),
        "LISTENING": client.l10n(interaction, "user.activity.listening"),
        "WATCHING": client.l10n(interaction, "user.activity.watching")
    };

    // Get the user's current activity
    const currentActivity = member.presence?.activities[0];

    // If user has a current activity
    if (currentActivity) {
        if (currentActivity.type === "CUSTOM") {
            // display their activity in the following format: [Emoji (if present)] [Status Message (if present)]
            activity = `${currentActivity.emoji ? currentActivity.emoji : "\u200b"} **${currentActivity.state ? currentActivity.state.truncate(24) : currentActivity.name}**`;
        } else {
            // if their status isn't a custom status, display their current activity (e.g. Listening to Spotify)
            activity = friendlyActivity[currentActivity.type].replace(/%activity%/g, `**${currentActivity.name}**`);
        }
    }

    // User data for points
    const data = await client.getUser(interaction.guild, member);

    // ROLES:
    // Get the guild member's roles (as a collection containing a Map per role)
    const memberRoles = interaction.guild.members.cache.get(interaction.targetId).roles.cache;
    
    // Surround every role's name with backticks, resulting in single-line code formatting for each one
    const formattedRoles = memberRoles.map(r => `\`${r.name}\``);

    // Remove @everyone from the array of roles
    let roles = formattedRoles.filter(r => r !== "`@everyone`");

    // Get the user's highest role
    const highestRole = interaction.guild.members.cache.get(interaction.targetId).roles.highest.name;

    // Move the user's highest role to the start of the array of roles
    roles = moveElementToStart(roles, `\`${highestRole}\``);

    // If the user has no roles, display "None"
    if (roles.length === 0) roles = ["None"];

    // Create and send embed
    const embed = new EmbedBuilder()
        .setColor("#8cfed9")
        .setThumbnail(user.displayAvatarURL({ size: 1024 }))
        .setDescription(stripIndents`
            **${user.tag}** ${badges} | ${statusEmoji} ${member.presence?.activities.length === 0 ? status[member.presence.status].toTitleCase() : activity}

            💥 **${client.l10n(interaction, "user.created")}**
            <t:${DateTime.fromJSDate(user.createdAt).toUTC().toUnixInteger()}>

            🏠 **${client.l10n(interaction, "user.joined")}**
            <t:${DateTime.fromJSDate(interaction.guild.members.cache.get(member.id).joinedAt).toUTC().toUnixInteger()}>

            🧮 **${client.l10n(interaction, "points").toTitleCase()}**
            Trivia: ${data.triviaPoints} • ${client.l10n(interaction, "user.points.regular")}: ${data.points}

            📋 **${client.l10n(interaction, "user.roles")}**
            ${roles.slice(0, 3).join(", ")} ${roles.length >= 4 ? client.l10n(interaction, "user.roles.more").replace(/%num%/g, roles.length - 3) : ""}`)
        .setFooter({ text: `${client.l10n(interaction, "user.id")}: ${member.id}` });
    
    interaction.reply({ embeds: [embed], ephemeral: true });
};

export const data = {
    name: "User Info",
    type: 2,  // USER
    options: [],
    defaultPermission: true,
    dm_permission: false
};

export const global = true;
