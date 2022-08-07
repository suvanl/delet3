export const run = async (client, interaction) => {    
    // Get user's current amount of points
    const { points } = await client.getUser(interaction.guild, interaction.user);

    // Inform user of how many points they currently have
    return interaction.reply({ content: client.l10n(interaction, "points.points").replace(/%num%/g, points), ephemeral: true });
};

export const data = {
    name: "points",
    description: "View your current points tally for this server",
    options: [],
    dm_permission: false
};

export const global = true;
