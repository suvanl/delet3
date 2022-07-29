import { ApplicationCommandOptionType } from "discord.js";

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
        type: ApplicationCommandOptionType.String,
        description: "The city to request weather information for",
        required: true
    }],
    defaultPermission: true
};

export const global = true;
