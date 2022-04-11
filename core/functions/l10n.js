import locales from "../locales";
import { readdirSync } from "fs";
import { sep } from "path";

// Locale file directory
const localeDir = `${process.cwd()}${sep}core${sep}locales`;

// Locales with regional variants in Discord's locale list
// Source: https://discord.com/developers/docs/dispatch/field-values#predefined-field-values-accepted-locales
const regional = [
    "en-US",
    "en-GB",
    "zh-CN",
    "zh-TW",
    "pt-BR",
    "es-ES",
    "sv-SE"
];

export default client => {
    // Localisation (l10n)
    // Language tag list: https://w.wiki/Lsd
    client.l10n = (message, str, locale = message.settings.language) => {
        // Read the list of locale files
        const localeFiles = readdirSync(localeDir);
        const lf = localeFiles.map(file => file.split(".")[0]);

        // If the type of message is not an application command (assuming it is of type 'DEFAULT')...
        if (message.type !== "APPLICATION_COMMAND") {
            // If a locale file matching the value of the "locale" parameter can't be found, return an error message
            if (!lf.includes(locale)) return client.logger.err(`Missing locale file: "${locale}"`);

            // Define the locale file path
            let locFile = locales[locale];

            // If the requested string key doesn't exist in the file, fall back to English (UK) [en-GB]
            if (!locFile[str]) locFile = locales["en-GB"];

            // Return the value of the specified key
            return locFile[str];
        }

        // If the command is indeed an application command...
        // Set the default locale to message.locale (docs: CommandInteraction.locale)
        locale = message.locale;

        let locFile;
        
        // If the interaction locale doesn't have a locale file associated with it...
        if (!lf.find(loc => loc.startsWith(locale))) {
            // Fall back to en-GB
            locFile = locFile = locales["en-GB"];
        } else if (regional.includes(locale)) {
            // If the interaction locale is in long-form (i.e., with a region tag), require the locale file
            locFile = locales[locale];
        } else {
            // If the interaction locale is in short-form (e.g., 'de'), find the first locale file name
            // that starts with the short-form locale string
            locFile = locales[lf.find(loc => loc.startsWith(locale))];
        }

        // If the requested string key doesn't exist in the file, fall back to English (UK) [en-GB]
        if (!locFile[str]) locFile = locales["en-GB"];

        // Return the value of the specified key
        return locFile[str];
    };
};