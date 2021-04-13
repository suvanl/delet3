const { stripIndents } = require("common-tags");
const { mlSettingsKey, friendlySettings } = require("../../core/util/data");

exports.run = async (client, message) => {
    // TODO: add functionality to change modLogData
    const cat = "modlog";
    const msg = stripIndents`
        ⚙️ ${client.l10n(message, "settings.prompt.cat").replace(/%category%/g, cat)}

        1️⃣ **Mod-log ${client.l10n(message, "channel")}**
        2️⃣ **Mod-log ${client.l10n(message, "on_off")}**

        ${client.l10n(message, "settings.exitInfo")}`;

    // Prompt for selected setting
    const selected = await client.awaitReply(message, msg);

    // If 60s is up / if reply is "cancel"
    if (!selected || selected.toLowerCase() === "cancel") return message.channel.send(`🚪 ${client.l10n(message, "settings.cancel")}`);

    // Valid answers
    const num = ["1", "2"];

    // If user doesn't reply with a number between 1 and 2
    if (!num.includes(selected)) return message.channel.send(client.l10n(message, "settings.invalidNum").replace(/%range%/g, "1-2"));
    else {
        // Else, if they have replied with 1-2...
        // Convert number to a settings key name
        const setting = mlSettingsKey[selected];

        // Relate number to message.settings
        const s = {
            1: message.settings.modLogChannel,
            2: message.settings.modLogEnabled
        };

        // User-friendly settings name
        const friendly = friendlySettings[setting];

        // Map object for multi-replace in localised string
        const mapObj = { "%setting%": friendly.toTitleCase(), "%value%": s[selected] };

        // Define message prompt
        const msg = stripIndents`
            ⚙️ ${client.l10n(message, "settings.prompt.currentValue").replace(/%setting%|%value%/g, matched => mapObj[matched])}
            🔄 ${client.l10n(message, "settings.prompt.newValue")} ${client.l10n(message, "settings.exitInfo")}`;

        // Prompt for new value
        const newValue = await client.awaitReply(message, msg);
        if (!newValue || newValue.toLowerCase() === "cancel") return message.channel.send(`🚪 ${client.l10n(message, "settings.cancel")}`);

        // Check if newValue matches the name of a channel in the guild
        if (setting === "modLogChannel") {
            const channel = message.guild.channels.cache.find(c => c.name === newValue.toLowerCase());
            if (!channel) return message.channel.send(`${client.l10n(message, "settings.missingChannel").replace(/%name%/g, newValue)}`);
        }

        // Update value of chosen setting in guild settings
        try {
            const update = await client.updateSettings(message.guild, setting, newValue.toLowerCase());
            if (update === 200) return message.channel.send(`<:tick:688400118549970984> ${friendly.toTitleCase()} successfully changed to \`${newValue.toLowerCase()}\`.`);
        } catch (err) {
            message.channel.send(`<:x_:688400118327672843> ${client.l10n(message, "settings.error")}`);
            return client.logger.err(`Error changing a modlog setting:\n${err.stack}`);   
        }
    }
};

exports.config = {
    aliases: [],
    enabled: true,
    guildOnly: true,
    permLevel: "Server Admin"
};

exports.help = {
    name: "modlog",
    description: "changes modlog-related settings",
    category: "settings",
    usage: "modlog"
};