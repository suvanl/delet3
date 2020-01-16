module.exports = {
    name: "arginfo",
    description: "info regarding provided arguments",
    category: "Information",
    usage: "<arguments>",
    args: true,
    aliases: ["arg-info", "args"],

    exec(message, args) {
        if (args[0] === "hello") return message.channel.send("hi 👋");
        message.channel.send(`arguments: \`${args}\`\nlength: ${args.length}`);
    }
};