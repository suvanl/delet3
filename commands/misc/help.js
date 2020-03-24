const { stripIndents } = require("common-tags");

exports.run = async (client, message, args, level) => {
    if (!args[0]) {
        const available = message.guild ? client.commands.filter(c => client.levelCache[c.config.permLevel] <= level) 
        : client.commands.filter(c => client.levelCache[c.config.permLevel] <= level && c.config.guildOnly !== true);

        let currentCat = "";
        let out = stripIndents`
             ℹ️ **Use \`${message.settings.prefix}help [command]\` for details**

            👨‍💻 **Visit {url} for further help & FAQ**

            ⚠️ **\`<>\` denotes required parameters**

            ⚙️ **\`[]\` denotes optional parameters**\n\u200b`;

        const sort = available.array().sort((p, c) => p.help.category > c.help.category ? 1
        : p.help.name > c.help.name && p.help.category === c.help.category ? 1 : -1);

        sort.forEach(c => {
            const cat = c.help.category.toProperCase();
            if (currentCat !== cat) {
                out += `\u200b\n**${cat}**\n`;
                currentCat = cat;
            }
            out += `\`${message.settings.prefix}${c.help.name}\`: ${c.help.description}.\n`;
        });

        const helpConfirm = await message.channel.send("<:tick:688400118549970984> Help is on its way!");
        message.author.send(out, { split: { char: "\u200b" } }).catch(err => {
            helpConfirm.edit(`<:x_:688400118327672843> Looks like I can't DM you, ${message.author}.\nPlease ensure your privacy settings on this server allow me to do so.`);
            return client.logger.err(err);
        });
    } else {
        // Command specific help
        let cmd = args[0];
        if (client.commands.has(cmd)) {
            cmd = client.commands.get(cmd);
            if (level < client.levelCache[cmd.config.permLevel]) return;
            message.channel.send(`**${cmd.help.name}** command\n${cmd.help.description}\n\nUsage: ${cmd.help.usage}\nAliases: ${cmd.config.aliases.join(", ")}`);
        }
    }
};

exports.config = {
    aliases: [],
    enabled: true,
    guildOnly: false,
    permLevel: "User"
};

exports.help = {
    name: "help",
    description: "sends a list of commands available to your permission level",
    category: "Misc",
    usage: "help [command]"
};