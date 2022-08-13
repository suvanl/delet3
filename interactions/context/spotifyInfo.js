import { ApplicationCommandType } from "discord.js";

export const run = async (client, interaction) => {
    await client.applicationCommands.get("spotify").run(client, interaction);
};

export const data = {
    name: "Spotify Track Info",
    type: ApplicationCommandType.User,
    dm_permission: true
};

export const global = true;
