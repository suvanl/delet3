import { ChannelType, EmbedBuilder, InteractionType } from "discord.js";
import { stripIndents } from "common-tags";
import { emoji, colour } from "../../core/util/data";

export const run = async (client, message, args, level) => {
    // if no args are provided
    if (!args[0]) {
        // filter all commands available to the user, based on their permLevel and whether they are in a guild or not
        const available = message.guild ? client.commands.filter(c => client.levelCache.get(c.config.permLevel) <= level) 
        : client.commands.filter(c => client.levelCache.get(c.config.permLevel) <= level && c.config.guildOnly !== true);

        // Initialise variable for the name of the command's category
        let currentCat = "";

        // Start creation of output
        let out = stripIndents`
             ℹ️ **Use \`${message.settings.prefix}help [command]\` for details**

            👨‍💻 **Visit {url} for further help & FAQ**

            ⚠️ **\`<>\` denotes required parameters**

            ⚙️ **\`[]\` denotes optional parameters**\n\u200b`;        
        
        // This ternary if statement addiction is not healthy...
        const sort = [...available.values()].sort((p, c) => (p.help.category > c.help.category ? 1
        : p.help.name > c.help.name && p.help.category === c.help.category) ? 1 : -1);

        // loop through each command that has been sorted by category...
        sort.forEach(c => {
            // convert the command's category name to title case 
            const cat = c.help.category.toTitleCase();

            // if the current category no longer matches the value of the "cat" variable,
            // we must have reached a command that belongs to a new category
            if (currentCat !== cat) {
                // add the name of the new category to the top of the list of commands in this category
                out += `\u200b\n**${cat}**\n`;
                currentCat = cat;
            }

            // append the command name (with prefix) and description to the output
            out += `\`${message.settings.prefix}${c.help.name}\`: ${c.help.description}.\n`;
        });

        
        // If in a regular text channel...
        if (message.channel.type === ChannelType.GuildText) {
            const helpConfirmTxt = `🏃‍♀️💨 ${client.l10n(message, "help.dmConfirm")}`;

            // if applicationcommand
            if (message.type === InteractionType.ApplicationCommand) {
                await message.reply(helpConfirmTxt);
                message.user.send(out)
                    .catch(err => {
                        message.followUp(stripIndents`
                            <:x_:688400118327672843> ${client.l10n(message, "help.dmError").replace(/%user%/g, message.author)}
                            ${client.l10n(message, "help.dmErrorInfo")}`);

                        // log the error that occurs
                        return client.logger.error(err);
                    });
            } else {
                // inform the user that the help output will be sent to their DMs
                const helpConfirm = await message.reply(helpConfirmTxt);
                message.author.send(out, { split: { char: "\u200b" } })
                    .catch(err => {
                        // if an error occurs in sending a DM to the message author,
                        // edit the help confirmation message to inform them of this
                        helpConfirm.edit(stripIndents`
                            <:x_:688400118327672843> ${client.l10n(message, "help.dmError").replace(/%user%/g, message.author)}
                            ${client.l10n(message, "help.dmErrorInfo")}`);

                        // log the error that occurs
                        return client.logger.error(err);
                    });
            }
        } else if (message.channel.type === ChannelType.DM) {
            // if the command is invoked in a DM channel, send the output 
            return message.reply(out, { split: { char: "\u200b" } });
        }
    } else {
        // Command-specific help
        // Take the first provided argument as the name of the command to provide specific help for
        let cmd = args[0];

        // if a command with this name actually exists...
        if (client.commands.has(cmd)) {
            // fetch the command from the "commands" collection
            cmd = client.commands.get(cmd);

            // if the user has insufficient perms to use this command, return
            if (level < client.levelCache.get(cmd.config.permLevel)) return;

            // Create embed containing the command's description, usage and aliases
            const embed = new EmbedBuilder()
                .setColor(colour[cmd.help.category])
                .setDescription(stripIndents`
                    ${emoji[cmd.help.category]} **${cmd.help.name.toTitleCase()} Command**
                    ${cmd.help.description}

                    **usage**
                    \`${message.settings.prefix}${cmd.help.usage}\`

                    **aliases**
                    ${cmd.config.aliases.length !== 0 ? cmd.config.aliases.map(a => `\`${a}\``).join(", ") : "`[ none ]`"}`)   
                .setFooter({ text: "< > = required parameter \u2022 [ ] = optional parameter" });

            // Send the embed
            message.reply({ embeds: [embed] });
        }
    }
};

export const config = {
    aliases: [],
    enabled: true,
    guildOnly: false,
    permLevel: "User"
};

export const help = {
    name: "help",
    description: "sends a list of commands available to your permission level",
    category: "misc",
    usage: "help [command]"
};