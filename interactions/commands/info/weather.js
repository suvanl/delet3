export const run = async (client, interaction) => {
    const city = interaction.options.getString("city");
    const args = city.split(" ");
    await client.commands.get("weather").run(client, interaction, args);
};

export const data = {
    name: "weather",
    description: "Sends weather info for the specified area",
    options: [{ 
        name: "city",
        // Type STRING is 3
        // Source: https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-option-type
        type: 3,
        description: "The city to request weather information for",
        required: true
    }],
    defaultPermission: true
};

export const global = true;
