const { stripIndents } = require("common-tags");
const { langNameText } = require("../../core/util/data");

exports.run = async (client, message) => {
    message.channel.send(stripIndents`
        __**Server Settings**__

        ℹ️ **Use \`${message.settings.prefix}<category>\` to change settings in each category**
        📖 **E.g. \`${message.settings.prefix}welcome\` to change welcome-related settings**
        ➡️ **To change "Other" settings, use \`${message.settings.prefix}<setting>\`**

        📋 **Role**
        - Admin Role: \`${message.settings.adminRole}\`
        - Mod Role: \`${message.settings.modRole}\`
        - Auto-Role Name: \`${message.settings.autoRoleName}\`
        - Auto-Role Enabled: \`${message.settings.autoRoleEnabled}\`

        👮 **Modlog**
        - Mod-Log Channel: \`${message.settings.modLogChannel}\`
        - Mod-Log Enabled: \`${message.settings.modLogEnabled}\`

        👋 **Welcome**
        - Welcome Channel: \`${message.settings.welcomeChannel}\`
        - Welcome Message: \`${message.settings.welcomeMessage}\`
        - Welcome Enabled: \`${message.settings.welcomeEnabled}\`

        💬 **Other**
        - Prefix: \`${message.settings.prefix}\`
        - Language: \`${langNameText[message.settings.language]}\``);
};

exports.config = {
    aliases: ["set"],
    enabled: true,
    guildOnly: true,
    permLevel: "Server Admin"
};

exports.help = {
    name: "settings",
    description: "displays the current server's settings",
    category: "settings",
    usage: "settings"
};