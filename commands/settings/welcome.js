const { stripIndents } = require("common-tags");
const { welcSettingsKey, friendlySettings } = require("../../core/util/data");

exports.run = async (client, message) => {
    const cat = "welcome";
    const msg = stripIndents`
        ⚙️ ${client.l10n(message, "settings.prompt.cat").replace(/%category%/g, cat)}

        1️⃣ **${client.l10n(message, "settings.welcomeChannel")}**
        2️⃣ **${client.l10n(message, "settings.welcomeMessage")}**
        3️⃣ **${client.l10n(message, "settings.welcomeEnabled")}**

        ${client.l10n(message, "settings.exitInfo")}`;

    // Prompt for selected setting
    const selected = await client.awaitReply(message, msg);

    // If 60s is up / if reply is "cancel"
    if (!selected || selected.toLowerCase() === "cancel") return message.channel.send(`🚪 ${client.l10n(message, "settings.cancel")}`);

    // Valid answers
    const num = ["1", "2", "3"];

    // If user doesn't reply with a number between 1 and 3
    if (!num.includes(selected)) return message.channel.send(client.l10n(message, "settings.invalidNum").replace(/%range%/g, "1-3"));
    else {
        // Else, if they have replied with 1-3...
        // Convert number to settings key name
        const setting = welcSettingsKey[selected];

        // Relate number to message.settings
        const s = {
            1: message.settings.welcomeChannel,
            2: message.settings.welcomeMessage,
            3: message.settings.welcomeEnabled
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

        // Check if newValue matches the name of a channel on the guild (for welcomeChannel)
        if (setting === "welcomeChannel") {
            const channel = message.guild.channels.cache.find(c => c.name === newValue.toLowerCase());
            if (!channel) return message.channel.send(`${client.l10n(message, "settings.missingChannel").replace(/%name%/g, newValue)}`);
        }

        // Update value of chosen setting in guild settings
        try {
            const update = await client.updateSettings(message.guild, setting, newValue);
            if (update === 200) return message.channel.send(`<:tick:688400118549970984> ${friendly.toTitleCase()} successfully changed to \`${newValue}\`.`);
        } catch (err) {
            message.channel.send(`<:x_:688400118327672843> ${client.l10n(message, "settings.error")}`);
            return client.logger.err(`Error changing a welcome setting:\n${err.stack}`);
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
    name: "welcome",
    description: "changes welcome-related settings",
    category: "settings",
    usage: "welcome"
};