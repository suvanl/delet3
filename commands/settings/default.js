exports.run = async (client, message) => {
    const msg = "⚠️ Are you sure you want to restore defaults? (`Y`/`N`)\nReply with `cancel` to exit.";

    // Prompt user
    const res = await client.awaitReply(message, msg);

    // Cancel if 60s is up / if reply is "cancel" or "n(o)"
    const cancel = ["cancel", "n", "no"];
    if (!res || cancel.includes(res.toLowerCase())) return message.channel.send("🚪 Ended the settings customisation procedure.");

    // If reply is "y(es)"
    if (res.toLowerCase() === "y" || res.toLowerCase() === "yes") {
        const msg = await message.channel.send("🔄 Restoring defaults...");
        const reset = await client.resetDefaults(message.guild);
        if (reset === 201) return msg.edit("<:tick:688400118549970984> Default server settings were successfully restored.");
    }
};

exports.config = {
    aliases: ["defaults", "restore"],
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