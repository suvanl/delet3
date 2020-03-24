exports.run = async (client, message) => {
    const msg = await message.channel.send("Processing...");
    msg.edit(`Hi, ${message.author.tag}.\nRES TIME: \`${msg.createdTimestamp - message.createdTimestamp}ms\`; WS PING: \`${Math.round(client.ws.ping)}ms\``);
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