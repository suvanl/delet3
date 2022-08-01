import { ApplicationCommandType } from "discord.js";

export const run = async (client, interaction) => {
    await client.applicationCommands.get("server").run(client, interaction);
};

export const data = {
    name: "Server Info",
    type: ApplicationCommandType.Message,
    options: [],
    defaultPermission: true,
    dm_permission: false
};

export const global = true;
