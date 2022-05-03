export const run = async (client, interaction) => {
    await client.applicationCommands.get("server").run(client, interaction);
};

export const data = {
    name: "Server Info",
    type: 3,  // MESSAGE
    options: [],
    defaultPermission: true
};

export const global = true;
