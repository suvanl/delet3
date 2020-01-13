module.exports = {
    name: "ping",
    description: "pong",
    category: "Information",
    usage: "ping",
    aliases: [],

    exec(message, /*args*/) {
        message.channel.send("pong 🏓");
    }
};