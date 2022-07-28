import { EmbedBuilder } from "discord.js";

export const run = async (client, message, args) => {
    // Get user's current amount of points
    // Note that message.user (interaction.user) is required for this command's slash command equivalent
    const userData = await client.getUser(message.guild, message.author || message.user);
    const points = userData.points;

    // Points leaderboard
    const lbAliases = ["leaderboard", "lb", "true"];
    if (args[0] && lbAliases.includes(args[0].toLowerCase())) {
        // Fetch all users
        const all = await client.getUsers();

        // Filter out users who aren't in this guild, as well as users who have 0 points
        const filtered = all.filter(a => a.guildID === message.guild.id && a.points >= parseInt(1));

        // Sort filtered users by number of points
        const sorted = filtered.sort((a, b) => a.points < b.points ? 1 : -1);

        // Create leaderboard
        let lbMsg = `🔢 ${client.l10n(message, "points.lb.header").replace(/%name%/g, message.guild.name)}\n\n`;
        let index = 0;

        const lb = sorted.map(async m => {
            const u = await client.users.fetch(m.userID);
            return `**${++index}** | ${u.username}#${u.discriminator} - **${m.points}** ${client.l10n(message, "points")}`;
        });

        // Send leaderboard
        return Promise.all(lb).then(res => {
            lbMsg += res.join("\n");
            
            const embed = new EmbedBuilder()
                .setColor(filtered.length === 0 ? "#ff8d6f" : "#77d9cc")
                .setDescription(lbMsg);

            message.reply({ embeds: [embed] });
        });
    }

    // Inform user of how many points they currently have
    return message.reply({ content: client.l10n(message, "points.points").replace(/%num%/g, points), ephemeral: true });
};

export const config = {
    aliases: ["pts"],
    enabled: true,
    guildOnly: true,
    permLevel: "User"
};

export const help = {
    name: "points",
    description: "view your current number of points, or the server's points leaderboard",
    category: "misc",
    usage: "points [leaderboard]"
};