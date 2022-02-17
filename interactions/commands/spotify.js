exports.run = async (client, interaction) => {
    const cover = interaction.options.getBoolean("cover");
    const args = cover ? cover.toString().split(" ") : [];
    await client.commands.get("spotify").run(client, interaction, args);
};

exports.data = {
    name: "spotify",
    description: "Sends info about the track you're currently listening to on Spotify",
    options: [{ 
        name: "cover",
        type: 5,  // Boolean
        description: "Whether you'd like to see only the track's cover art, without any other info",
        required: false
    }],
    defaultPermission: true
};

exports.global = false;