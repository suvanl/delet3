exports.run = async (client, message) => {
    const msg = "⚠️ Are you sure you want to restore defaults? (`Y`/`N`)\nReply with `cancel` to exit.";

    // Prompt user
    const res = await client.awaitReply(message, msg);

    // Cancel if 60s is up / if reply is "cancel" or "n(o)"
    const cancel = ["cancel", "n", "no"];
    if (!res || cancel.includes(res.toLowerCase())) return message.channel.send(`🚪 ${client.l10n(message, "settings.cancel")}`);

    // If reply is "y(es)"
    if (res.toLowerCase() === "y" || res.toLowerCase() === "yes") {
        // Inform the user that all settings are being reset to default values
        const msg = await message.channel.send(`🔄 ${client.l10n(message, "settings.restoringDefaults")}`);

        // Reset settings
        const reset = await client.resetDefaults(message.guild);

        // If client.resetDefaults() returns a "201 Created" HTTP status code, inform the user that the reset was successful
        if (reset === 201) return msg.edit("<:tick:688400118549970984> Default server settings were successfully restored.");
    }
};

exports.config = {
    aliases: ["defaults", "restore", "reset"],
    enabled: true,
    guildOnly: true,
    permLevel: "Server Admin"
};

exports.help = {
    name: "default",
    description: "resets default server settings",
    category: "settings",
    usage: "default"
};