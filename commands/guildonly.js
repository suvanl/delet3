module.exports = {
    name: "guildonly",
    description: "an example of a guild-only command",
    category: "Misc",
    guildOnly: true,
    aliases: ["guild-only", "serveronly"],

    exec(message) {
        return message.channel.send("moderation commands are common guild-only commands");
    }
};