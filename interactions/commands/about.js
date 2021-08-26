exports.run = async (client, interaction) => {
    // Get the "about" command from the client.commands collection and call its run() function
    await client.commands.get("about").run(client, interaction);
};

exports.data = {
    name: "about",
    description: "Sends info about myself",
    options: [],
    defaultPermission: true
};

exports.global = false;