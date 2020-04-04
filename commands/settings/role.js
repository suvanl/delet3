const { stripIndents } = require("common-tags");
const { roleSettingsKey, friendlySettings } = require("../../core/util/data");

exports.run = async (client, message) => {
    const msg = stripIndents`
        ⚙️ Which role-related setting would you like to update?

        1️⃣ **Admin role**
        2️⃣ **Mod role**
        3️⃣ **Auto-role name**
        4️⃣ **Auto-role on/off**
        
        Reply with \`cancel\` to exit.`;

    // Prompt for selected setting
    const selected = await client.awaitReply(message, msg);

    // If 60s is up / if reply is "cancel"
    if (!selected || selected.toLowerCase() === "cancel") return message.channel.send("🚪 Ended the settings customisation procedure.");

    // Valid answers
    const num = ["1", "2", "3", "4"];

    // If user doesn't reply with a number between 1 and 4
    if (!num.includes(selected)) return message.channel.send("Invalid value specified. Please reply with a value from 1-4.");
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

        // Define message prompt
        const msg = stripIndents`
            ⚙️ The current value of **${friendly.toTitleCase()}** is \`${s[selected]}\`.
            🔄 Please enter the new value. Reply with \`cancel\` to exit.`;
        
        // Prompt for new value
        const newValue = await client.awaitReply(message, msg);
        if (!newValue || newValue.toLowerCase() === "cancel") return message.channel.send("🚪 Ended the settings customisation procedure.");

        // Check if newValue matches the name of a role on the guild (unless autoRoleEnabled is being changed, which takes boolean values)
        if (setting !== "autoRoleEnabled") {
            const role = message.guild.roles.cache.find(r => r.name === newValue);
            if (!role) return message.channel.send(`A role with the name \`${newValue}\` could not be found on this server.`);
        }

        // Update value of chosen setting in guild settings
        try {
            const update = await client.updateSettings(message.guild, setting, newValue);
            if (update === 200) return message.channel.send(`<:tick:688400118549970984> ${friendly.toTitleCase()} successfully changed to \`${newValue}\`.`);
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
    permLevel: "Server Admin"
};

exports.help = {
    name: "role",
    description: "changes role-related settings",
    category: "settings",
    usage: "role"
};