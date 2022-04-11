import { stripIndents } from "common-tags";
import { mlSettingsKey, friendlySettings } from "../../core/util/data";

export const run = async (client, message) => {
    const cat = "modlog";
    const msg = stripIndents`
        ⚙️ ${client.l10n(message, "settings.prompt.cat").replace(/%category%/g, cat)}

        1️⃣ **Mod-log ${client.l10n(message, "channel")}**
        2️⃣ **Mod-log ${client.l10n(message, "data")}**
        3️⃣ **Mod-log ${client.l10n(message, "on_off")}**

        ${client.l10n(message, "settings.exitInfo")}`;

    // Prompt for selected setting
    const selected = await client.awaitReply(message, msg);

    // If 60s is up / if reply is "cancel"
    if (!selected || selected.toLowerCase() === "cancel") return message.channel.send(`🚪 ${client.l10n(message, "settings.cancel")}`);

    // Valid answers
    const num = ["1", "2", "3"];

    // Valid types of modLogData
    const validModLogData = ["joinLeave", "nameChange", "kickBan"];

    // If user doesn't reply with a number between 1 and 3, inform them that their response is invalid
    if (!num.includes(selected)) return message.channel.send(client.l10n(message, "settings.invalidNum").replace(/%range%/g, "1-3"));
    else {
        // Else, if they have replied with 1-3...
        // Convert number to a settings key name
        const setting = mlSettingsKey[selected];

        // Relate number to message.settings
        const messageSettings = {
            1: message.settings.modLogChannel,
            2: message.settings.modLogData,
            3: message.settings.modLogEnabled
        };

        // User-friendly settings name
        const friendly = friendlySettings[setting];

        // Map object for multi-replace in localised string. If the selected value is modLogData, join each element in the array with
        // a space after the comma.
        const mapObj = {
            "%setting%": friendly.toTitleCase(),
            "%value%": setting === "modLogData" ? messageSettings[selected].join(", ") : messageSettings[selected]
        };

        // Define message prompt
        const msg = stripIndents`
            ⚙️ ${client.l10n(message, "settings.prompt.currentValue").replace(/%setting%|%value%/g, matched => mapObj[matched])}
            🔄 ${client.l10n(message, "settings.prompt.newValue")} ${client.l10n(message, "settings.exitInfo")}`;

        // Prompt for new value
        let newValue = await client.awaitReply(message, msg);

        // If the new value is "cancel" or if the awaited reply times out, confirm the cancellation
        if (!newValue || newValue.toLowerCase() === "cancel") return message.channel.send(`🚪 ${client.l10n(message, "settings.cancel")}`);

        // If the selected setting is modLogChannel, check if newValue matches the name of a channel in the guild
        if (setting === "modLogChannel") {
            const channel = message.guild.channels.cache.find(c => c.name === newValue.toLowerCase());
            if (!channel) return message.channel.send(`${client.l10n(message, "settings.missingChannel").replace(/%name%/g, newValue)}`);
        }

        // If the selected setting is modLogData, ensure they've provided a valid modlog data type (joinLeave / nameChange / kickBan)
        if (setting === "modLogData") {
            // Create an array of values provided by the user
            const newValueArr = newValue.split(", ");

            // Check whether the newly provided value(s) can be found in the validModLogData array
            const isValid = findMatchingElement(validModLogData, newValueArr);

            // If the value(s) can't be found, inform the user and return
            if (!isValid) {
                // Message content (en-GB):
                //  ⚠ Invalid mod-log data type(s) provided
                //  The valid types are: joinLeave, nameChange, kickBan.
                message.channel.send(stripIndents`
                    ⚠ **${client.l10n(message, "settings.invalidModLogData")}**
                    ${client.l10n(message, "settings.invalidModLogData.info").replace(/%types%/g, validModLogData.map(d => `\`${d}\``).join(", "))}`);

                return message.channel.send(`🚪 ${client.l10n(message, "settings.cancel")}`);
            }
        }

        // Update value of chosen setting in guild settings
        try {
            // If the setting being updated is modLogData, convert the new value to an array
            if (setting === "modLogData") newValue = newValue.split(", ");

            // If the setting being changed has a boolean value, ensure it is lowercase
            if (newValue === "true" || newValue === "false") newValue = newValue.toLowerCase();

            // Update the value of the chosen setting in the current guild's settings
            const update = await client.updateSettings(message.guild, setting, newValue);

            // If the update request returns a "200 OK" HTTP status response code, inform the user that the setting has been updated
            if (update === 200) return message.channel.send(`<:tick:688400118549970984> **${friendly.toTitleCase()}** successfully changed to \`${newValue}\`.`);
        } catch (err) {
            // Inform the user that an error has occurred and log the error
            message.channel.send(`<:x_:688400118327672843> ${client.l10n(message, "settings.error")}`);
            return client.logger.err(`Error changing a modlog setting:\n${err.stack}`);   
        }
    }
};

// Determines whether an array contains all items from another array
// Params:
//  haystack: the array to search
//       arr: the array containing the items to check for in the haystack
const findMatchingElement = (haystack, arr) => arr.every(value => haystack.includes(value));

export const config = {
    aliases: [],
    enabled: true,
    guildOnly: true,
    permLevel: "Server Admin"
};

export const help = {
    name: "modlog",
    description: "changes modlog-related settings",
    category: "settings",
    usage: "modlog"
};