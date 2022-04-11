import { stripIndents } from "common-tags";
import { roleSettingsKey, friendlySettings } from "../../core/util/data";

export const run = async (client, message) => {
    const cat = "role";
    const msg = stripIndents`
        ⚙️ ${client.l10n(message, "settings.prompt.cat").replace(/%category%/g, cat)}

        1️⃣ **${client.l10n(message, "settings.adminRole")}**
        2️⃣ **${client.l10n(message, "settings.modRole")}**
        3️⃣ **${client.l10n(message, "settings.autoRoleName")}**
        4️⃣ **${client.l10n(message, "settings.autoRoleEnabled")}**
        
        ${client.l10n(message, "settings.exitInfo")}`;

    // Prompt for selected setting
    const selected = await client.awaitReply(message, msg);

    // If 60s is up / if reply is "cancel"
    if (!selected || selected.toLowerCase() === "cancel") return message.channel.send(`🚪 ${client.l10n(message, "settings.cancel")}`);

    // Valid answers
    const num = ["1", "2", "3", "4"];

    // If user doesn't reply with a number between 1 and 4
    if (!num.includes(selected)) return message.channel.send(client.l10n(message, "settings.invalidNum").replace(/%range%/g, "1-4"));
    else {
        // Else, if they have replied with 1-4...
        // Convert number to settings key name
        const setting = roleSettingsKey[selected];

        // Relate number to message.settings
        const s = {
            1: message.settings.adminRole,
            2: message.settings.modRole,
            3: message.settings.autoRoleName,
            4: message.settings.autoRoleEnabled
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

        // Check if newValue matches the name of a role on the guild (unless autoRoleEnabled is being changed, which takes boolean values)
        if (setting !== "autoRoleEnabled") {
            const role = message.guild.roles.cache.find(r => r.name === newValue);
            if (!role) return message.channel.send(`${client.l10n(message, "settings.missingRole").replace(/%name%/g, newValue)}`);
        }

        // Update value of chosen setting in guild settings
        try {
            const update = await client.updateSettings(message.guild, setting, newValue);
            if (update === 200) return message.channel.send(`<:tick:688400118549970984> ${friendly.toTitleCase()} successfully changed to \`${newValue}\`.`);
        } catch (err) {
            message.channel.send(`<:x_:688400118327672843> ${client.l10n(message, "settings.error")}`);
            return client.logger.err(`Error changing a role setting:\n${err.stack}`);
        }
    }
};

export const config = {
    aliases: [],
    enabled: true,
    guildOnly: true,
    permLevel: "Server Admin"
};

export const help = {
    name: "role",
    description: "changes role-related settings",
    category: "settings",
    usage: "role"
};