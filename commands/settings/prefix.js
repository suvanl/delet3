import { stripIndents } from "common-tags";

export const run = async (client, message, args) => {
    const msg = stripIndents`
        ⚙️ The current prefix is \`${message.settings.prefix}\`.
        🔄 Please enter the new prefix. Reply with \`cancel\` to exit.`;

    const newPrefix = args[0] || await client.awaitReply(message, msg);
    if (!newPrefix || newPrefix.toLowerCase() === "cancel") return message.channel.send(`🚪 ${client.l10n(message, "settings.cancel")}`);

    try {
        const update = await client.updateSettings(message.guild, "prefix", newPrefix);
        if (update === 200) return message.channel.send(`<:tick:688400118549970984> Prefix successfully changed to \`${newPrefix}\`.`);
    } catch (err) {
        message.channel.send(`<:x_:688400118327672843> ${client.l10n(message, "settings.error")}`);
        return client.logger.error(`Error changing prefix:\n${err.stack}`);
    }
};

export const config = {
    aliases: [],
    enabled: true,
    guildOnly: true,
    permLevel: "Server Admin"
};

export const help = {
    name: "prefix",
    description: "changes delet's prefix on the current server",
    category: "settings",
    usage: "prefix [prefix]"
};