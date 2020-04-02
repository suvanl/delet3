const { stripIndents } = require("common-tags");
const { mlSettingsKey, friendlySettings } = require("../../core/util/data");

exports.run = async (client, message) => {
    const msg = stripIndents`
        ⚙️ Which mod-log related setting would you like to update?

        1️⃣ **Mod-log channel**
        2️⃣ **Mod-log on/off**

        Reply with \`cancel\` to exit.`;

    // Prompt for selected setting
    const selected = await client.awaitReply(message, msg);

    // If 60s is up / if reply is "cancel"
    if (!selected || selected.toLowerCase() === "cancel") return message.channel.send("🚪 Ended the settings customisation procedure.");

    // Valid answers
    const num = ["1", "2"];

    // If user doesn't reply with a number between 1 and 2
    if (!num.includes(selected)) return message.channel.send("Invalid value specified. Please reply with a value from 1-2.");
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

        // Define message prompt
        const msg = stripIndents`
            ⚙️ The current value of **${friendly.toTitleCase()}** is \`${s[selected]}\`.
            🔄 Please enter the new value. Reply with \`cancel\` to exit.`;

        // Prompt for new value
        const newValue = await client.awaitReply(message, msg);
        if (!newValue || newValue.toLowerCase() === "cancel") return message.channel.send("🚪 Ended the settings customisation procedure.");

        // Check if newValue matches the name of a channel in the guild
        if (setting === "modLogChannel") {
            const channel = message.guild.channels.cache.find(c => c.name === newValue.toLowerCase());
            if (!channel) return message.channel.send(`A channel with the name \`${newValue}\` could not be found on this server.`);
        }

        // Update value of chosen setting in guild settings
        try {
            const update = await client.updateSettings(message.guild, setting, newValue.toLowerCase());
            if (update === 200) return message.channel.send(`<:tick:688400118549970984> ${friendly.toTitleCase()} successfully changed to \`${newValue.toLowerCase()}\`.`);
        } catch (err) {
            message.channel.send("<:x_:688400118327672843> An error occurred while changing this setting.");
            return client.logger.err(`Error changing a role setting:\n${err.stack}`);   
        }
    }

};

exports.config = {
    aliases: [],
    enabled: true,
    guildOnly: true,
    permLevel: "Server Moderator"
};

exports.help = {
    name: "modlog",
    description: "changes modlog-related settings",
    category: "settings",
    usage: "modlog"
};