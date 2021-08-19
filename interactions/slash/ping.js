exports.run = async (client, interaction) => {
    const msg = "🏓 Pong!";
    await interaction.deferReply();
    const reply = await interaction.editReply(msg);
    await interaction.editReply(`${msg} ${client.l10n(interaction, "latency")}: \`${reply.createdTimestamp - interaction.createdTimestamp}ms\`; WebSocket ping: \`${Math.round(client.ws.ping)}ms\`.`);
};

exports.data = {
    name: "ping",
    description: "Sends latency/API response times",
    options: [],
    defaultPermission: true
};

exports.global = true;