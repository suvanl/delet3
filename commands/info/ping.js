exports.run = async (client, message) => {
    const msg = await message.channel.send("🏓 Pong!");
    msg.edit(`🏓 Pong! ${client.l10n(message, "latency")}: \`${msg.createdTimestamp - message.createdTimestamp}ms\`; WebSocket ping: \`${Math.round(client.ws.ping)}ms\`.`);
};

exports.config = {
    aliases: ["latency"],
    enabled: true,
    guildOnly: false,
    permLevel: "User"
};

exports.help = {
    name: "ping",
    description: "sends latency/API response times",
    category: "info",
    usage: "ping"
};