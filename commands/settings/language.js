import { stripIndents } from "common-tags";
import { langName, validLangs } from "../../core/util/data";

export const run = async (client, message, args) => {
    // This command has been left in English (delet's default language) in case a user accidentally switches to a different
    // language and needs to switch back to the default language.

    // Define current language info message
    const msg = stripIndents`
        ⚙️ The current language is **${langName[message.settings.language]}** (\`${message.settings.language}\`).
        📖 Use \`${message.settings.prefix}language available\` to see a list of valid languages (with tags).
        🔄 Please enter the new language tag. Reply with \`cancel\` to exit.`;

    // If the user runs "%language available", respond with a list of valid languages.
    // This list contains the flag of the country each language is spoken in (for quicker/easier identification), as well as
    // the language's name in the local language and the language code in brackets.
    //
    // This list is created by using the .map() method on the validLangs array (from the data.js util file); adding the language
    // name/flag before the language code (from the array).
    if (args[0] && args[0].toLowerCase() === "available") return message.channel.send(stripIndents`
        🌍 **Available languages**

        ${validLangs.map(l => `${langName[l]} (\`${l}\`)`).join("\n")}`);

    // Define the new language as the first provided argument. If no args are provided, send the current language info message and
    // await the user's response.
    const newLanguage = args[0] || await client.awaitReply(message, msg);

    // If the awaited reply times out or the user responds with "cancel", confirm the cancellation and return.
    if (!newLanguage || newLanguage.toLowerCase() === "cancel") return message.channel.send(`🚪 ${client.l10n(message, "settings.cancel")}`);

    // Return and inform the user if an invalid language tag is provided
    if (!validLangs.includes(newLanguage)) return message.channel.send(stripIndents`
        "${newLanguage}" is either an invalid or unavailable language tag.
        Please use \`${message.settings.prefix}language available\` to see a list of valid languages.`);

    try {
        // Update the current guild's language and inform the user if the change is successful
        const update = await client.updateSettings(message.guild, "language", newLanguage);
        if (update === 200) return message.channel.send(`<:tick:688400118549970984> Language successfully changed to \`${newLanguage}\`.`);
    } catch (err) {
        // Inform the user if an error occurs while updating the guild's language and log the error
        message.channel.send(`<:x_:688400118327672843> ${client.l10n(message, "settings.error")}`);
        return client.logger.error(`Error changing language:\n${err.stack}`);
    }
};

export const config = {
    aliases: ["lang", "locale"],
    enabled: true,
    guildOnly: true,
    permLevel: "Server Admin"
};

export const help = {
    name: "language",
    description: "changes delet's language on the current server",
    category: "settings",
    usage: "language [locale]"
};