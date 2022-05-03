export const run = async (client, message) => {
    client.sendDeprecationWarning(message, "use the `/ping` slash command instead.");

    const msg = await message.channel.send("🏓 Pong!");
    msg.edit(`🏓 Pong! ${client.l10n(message, "latency")}: \`${msg.createdTimestamp - message.createdTimestamp}ms\`; WebSocket ping: \`${Math.round(client.ws.ping)}ms\`.`);
};

export const config = {
    aliases: ["latency"],
    enabled: true,
    guildOnly: false,
    permLevel: "User"
};

export const help = {
    name: "ping",
    description: "sends latency/API response times",
    category: "info",
    usage: "ping"
};