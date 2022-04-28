import { stripIndents } from "common-tags";
import { friendlySettings } from "../../core/util/data";

export const run = async (client, message, args) => {
    const msg = stripIndents`
        ⚙️ The current value of **${friendlySettings["verificationEnabled"].toTitleCase()}** is: \`${message.settings.verificationEnabled}\`.
        🔄 Please enter the new value (\`true\`/\`false\`). Reply with \`cancel\` to exit.`;

    const newValue = args[0] || await client.awaitReply(message, msg);
    if (!newValue || newValue.toLowerCase() === "cancel") return message.channel.send(`🚪 ${client.l10n(message, "settings.cancel")}`);

    try {
        const update = await client.updateSettings(message.guild, "verificationEnabled", newValue);
        if (update === 200) return message.channel.send(`<:tick:688400118549970984> verificationEnabled successfully changed to \`${newValue}\`.`);
    } catch (err) {
        message.channel.send(`<:x_:688400118327672843> ${client.l10n(message, "settings.error")}`);
        return client.logger.error(`Error changing verificationSystemEnabled:\n${err.stack}`);
    }
};

export const config = {
    aliases: [],
    enabled: true,
    guildOnly: true,
    permLevel: "Server Admin"
};

export const help = {
    name: "verification",
    description: "enables/disables delet's verification system on the current server",
    category: "settings",
    usage: "verification [true|false]"
};
