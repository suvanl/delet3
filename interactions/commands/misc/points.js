export const run = async (client, interaction) => {
    const lb = interaction.options.getBoolean("leaderboard");
    const args = lb ? lb.toString().split(" ") : [];
    await client.commands.get("points").run(client, interaction, args);
};

export const data = {
    name: "points",
    description: "View your current points tally, or the server's points leaderboard",
    options: [{ 
        name: "leaderboard",
        type: 5,  // Boolean
        description: "Whether you'd like to see the server's points leaderboard",
        required: false
    }],
    defaultPermission: true
};

export const global = true;
