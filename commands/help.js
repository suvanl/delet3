const { PREFIX } = process.env;

module.exports = {
    name: "help",
    description: "sends a list of all available commands, or command-specific info",
    category: "Information",
    usage: "[command name]",
    args: true,
    aliases: ["commands"],

    exec(message, args) {
        const data = [];
        const { commands } = message.client;

        if (!args.length) {
            data.push("here's a list of commands available to you:");
            data.push(commands.map(c => c.name).join(", "));
            data.push(`\nyou can also send \`${PREFIX}help [command name]\` to get info on a specific command.`);

            return message.author.send(data, { split: true })
                .then(() => {
                    if (message.channel.type === "dm") return;
                    else message.reply("just sent you a DM with all available commands 💬");
                })
                .catch(error => {
                    console.error(`Could not send help DM to ${message.author.tag}.\n`, error);
                    message.reply("I can't seem to DM you... do you have DMs disabled?");
                });
        }

        const name = args[0].toLowerCase();
        const command = commands.get(name) || commands.find(c => c.aliases && c.aliases.includes(name));

        if (!command) return message.reply("that isn't a valid command.");

        data.push(`**Name:** ${command.name}`);

        if (command.aliases) data.push(`**Aliases:** ${command.aliases.join(", ")}`);
        if (command.description) data.push(`**Description:** ${command.description}`);
        if (command.usage) data.push(`**Usage:** ${PREFIX}${command.name} ${command.usage}`);

        data.push(`**Cooldown:** ${command.cooldown || 3} second(s)`);

        message.channel.send(data, { split: true });
    }
};