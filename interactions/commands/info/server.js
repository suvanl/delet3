export const run = async (client, interaction) => {
    // Get the "server" command from the client.commands collection and call its run() function
    await client.commands.get("server").run(client, interaction);
};

export const data = {
    name: "server",
    description: "Sends info about the current server",
    options: [],
    defaultPermission: true
};

export const global = true;
