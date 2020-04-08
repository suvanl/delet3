const { stripIndents } = require("common-tags");
const { MessageEmbed } = require("discord.js");
const { emoji, colour } = require("../../core/util/data");

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
            const cat = c.help.category.toTitleCase();
            if (currentCat !== cat) {
                out += `\u200b\n**${cat}**\n`;
                currentCat = cat;
            }
            out += `\`${message.settings.prefix}${c.help.name}\`: ${c.help.description}.\n`;
        });

        if (message.channel.type === "text") {
            const helpConfirm = await message.channel.send(`🏃‍♀️💨 ${client.l10n(message, "help.dmConfirm")}`);
            message.author.send(out, { split: { char: "\u200b" } }).catch(err => {
                helpConfirm.edit(`<:x_:688400118327672843> Looks like I can't DM you, ${message.author}.\nPlease ensure your privacy settings on this server allow me to do so.`);
                return client.logger.err(err);
            });
        } else if (message.channel.type === "dm") {
            return message.channel.send(out, { split: { char: "\u200b" } });
        }
    } else {
        // Command specific help
        let cmd = args[0];
        if (client.commands.has(cmd)) {
            cmd = client.commands.get(cmd);
            if (level < client.levelCache[cmd.config.permLevel]) return;

            const embed = new MessageEmbed()
                .setColor(colour[cmd.help.category])
                .setDescription(stripIndents`
                    ${emoji[cmd.help.category]} **${cmd.help.name.toTitleCase()} Command**
                    ${cmd.help.description}

                    **usage**
                    \`${message.settings.prefix}${cmd.help.usage}\`

                    **aliases**
                    ${cmd.config.aliases.length !== 0 ? cmd.config.aliases.map(a => `\`${a}\``).join(", ") : "`[ none ]`"}`);

            message.channel.send(embed);
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
    category: "misc",
    usage: "help [command]"
};