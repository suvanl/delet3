exports.run = async (client, interaction) => {
    const city = interaction.options.getString("city");
    const args = city.split(" ");
    await client.commands.get("forecast").run(client, interaction, args);
};

exports.data = {
    name: "forecast",
    description: "Sends the weather forecast for the specified area",
    options: [{ 
        name: "city",
        type: 3,  // String
        description: "The city to request the weather forecast for",
        required: true
    }],
    defaultPermission: true
};

exports.global = true;