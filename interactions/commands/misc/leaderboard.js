import { ApplicationCommandOptionType, EmbedBuilder } from "discord.js";

export const run = async (client, interaction) => {
    const subcommand = interaction.options.getSubcommand();
    
    // Return if no subcommand
    if (!["trivia", "points"].includes(subcommand)) return;

    // Create and send leaderboard
    await sendLeaderboard(client, interaction, subcommand);
};

const sendLeaderboard = async (client, interaction, type) => {
    // Fetch all users
    const all = await client.getUsers();

    // Use correct points type name from DB
    const pointsTypeName = type === "trivia" ? "triviaPoints" : "points";

    // Filter out users who aren't in this guild, as well as users who have 0 points of the specified type
    const filtered = all.filter(a => a.guildID === interaction.guild.id && a[pointsTypeName] >= 1);

    // Sort filtered users by number of points
    const sortedArr = filtered.sort((a, b) => a[pointsTypeName] < b[pointsTypeName] ? 1 : -1);
    if (type === "trivia" && sortedArr.length === 0) lbMsg += stripIndents`
        ${client.l10n(interaction, "trivia.lb.empty")}
        ${client.l10n(interaction, "trivia.lb.emptyInfo").replace(/%cmd%/g, "/trivia")}`;

    let lbMsg = `🔢 ${client.l10n(interaction, `${type}.lb.header`).replace(/%name%/g, interaction.guild.name)}\n\n`;

    const lb = sortedArr.map(async (element, index) => {
        // Ensure leaderboard only contains top 10 members
        if (index >= 9) return;
        
        // Get the user object of the current user (from their ID)
        const user = await client.users.fetch(element.userID);

        // Determine which points type to use
        const points = type === "trivia" ? element.triviaPoints : element.points;

        // Formatted string
        return `**${++index}** | ${user.username}#${user.discriminator} - **${points}** ${client.l10n(interaction, "points")}`;
    });

    const res = await Promise.all(lb);
    lbMsg += res.join("\n");

    const embed = new EmbedBuilder()
        .setColor(sortedArr.length === 0 ? "#ff8d6f" : (type === "trivia" ? "#6fe1ff" : "#77d9cc"))
        .setDescription(lbMsg);

    interaction.reply({ embeds: [embed] });
};

export const data = {
    name: "leaderboard",
    description: "View this server's leaderboards",
    options: [{
        name: "trivia",
        description: "View this server's trivia leaderboard (top 10)",
        type: ApplicationCommandOptionType.Subcommand
    },
    {
        name: "points",
        description: "View this server's points leaderboard (top 10)",
        type: ApplicationCommandOptionType.Subcommand
    }],
    dm_permission: false
};

export const global = true;
