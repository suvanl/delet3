export const run = async (client, interaction) => {
    // Get the "about" command from the client.commands collection and call its run() function
    await client.commands.get("about").run(client, interaction);
};

export const data = {
    name: "about",
    description: "Sends info about myself",
    options: [],
    defaultPermission: true
};

export const global = true;
