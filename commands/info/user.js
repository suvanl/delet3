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

    // Predefined data

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
    if (user.presence.activities.length !== 0) {
        const a = user.presence.activities[0];
        activity = a.type !== "CUSTOM_STATUS" ? `${a.type.toTitleCase()} **${a.name.truncate(24)}**` : a.name;
    }

    // User data for points
    const data = await client.getUser(message.guild, user);

    // Roles (with @everyone filtered out)
    const r = message.guild.member(user).roles.cache;
    const roleMap = r.map(r => `\`${r.name}\``);
    const roles = roleMap.filter(r => r !== "`@everyone`");

    console.log(roles.length);

    // Create and send embed
    const embed = new MessageEmbed()
        .setColor("#8cfed9")
        .setDescription(stripIndents`
            **${user.tag}** ${badges} | ${statusEmoji} ${user.presence.activities.length === 0 ? status[user.presence.status].toTitleCase() : activity}

            💥 **Account created**
            ${utc(user.createdTimestamp).format("DD/MM/YYYY [at] HH:mm")}

            🏠 **Joined this server**
            ${utc(message.guild.member(user).joinedTimestamp).format("DD/MM/YYYY [at] HH:mm")}

            🧮 **Points**
            Trivia: ${data.triviaPoints} • Regular: ${data.points}

            📋 **Roles**
            ${roles.slice(0, 3).join(", ")} ${roles.length >= 4 ? `and ${roles.length - 3} others` : ""}
        `)
        .setThumbnail(user.displayAvatarURL({ size: 1024 }))
        .setFooter(`User ID: ${user.id} | all times are UTC`);
    
    message.channel.send(embed);
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