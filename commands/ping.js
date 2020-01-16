module.exports = {
    name: "ping",
    description: "pong",
    cooldown: 5,
    category: "Information",
    aliases: [],

    exec(message) {
        message.channel.send("pong 🏓");
    }
};