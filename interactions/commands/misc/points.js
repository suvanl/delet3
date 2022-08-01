import { ApplicationCommandOptionType, EmbedBuilder } from "discord.js";

export const run = async (client, interaction) => {
    const lb = interaction.options.getBoolean("leaderboard");
    
    // Get user's current amount of points
    const { points } = await client.getUser(interaction.guild, interaction.user);

    // Points leaderboard
    if (lb) {
        // Fetch all users
        const all = await client.getUsers();

        // Filter out users who aren't in this guild, as well as users who have 0 points
        const filtered = all.filter(a => a.guildID === interaction.guild.id && a.points >= 1);

        // Sort filtered users by number of points
        const sorted = filtered.sort((a, b) => a.points < b.points ? 1 : -1);

        // Create leaderboard
        let lbMsg = `🔢 ${client.l10n(interaction, "points.lb.header").replace(/%name%/g, interaction.guild.name)}\n\n`;
        let index = 0;

        const lb = sorted.map(async m => {
            const u = await client.users.fetch(m.userID);
            return `**${++index}** | ${u.username}#${u.discriminator} - **${m.points}** ${client.l10n(interaction, "points")}`;
        });

        // Send leaderboard
        return Promise.all(lb).then(res => {
            lbMsg += res.join("\n");
            
            const embed = new EmbedBuilder()
                .setColor(filtered.length === 0 ? "#ff8d6f" : "#77d9cc")
                .setDescription(lbMsg);

            interaction.reply({ embeds: [embed] });
        });
    }

    // Inform user of how many points they currently have
    return interaction.reply({ content: client.l10n(interaction, "points.points").replace(/%num%/g, points), ephemeral: true });
};

export const data = {
    name: "points",
    description: "View your current points tally, or the server's points leaderboard",
    options: [{ 
        name: "leaderboard",
        type: ApplicationCommandOptionType.Boolean,
        description: "Whether you'd like to see the server's points leaderboard",
        required: false
    }]
};

export const global = false;
