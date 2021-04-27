const { readdirSync } = require("fs");
const { sep } = require("path");
const localeDir = `${process.cwd()}${sep}core${sep}locales`;

module.exports = client => {
    // Localisation (l10n)
    // Language tag list: https://w.wiki/Lsd
    client.l10n = (message, str, locale = message.settings.language) => {
        // Read the list of locale files
        const localeFiles = readdirSync(localeDir);
        const lf = localeFiles.map(file => file.split(".")[0]);

        // If a locale file matching the value of the "locale" parameter can't be found, return an error message
        if (!lf.includes(locale)) return client.logger.err(`Missing locale file: "${locale}"`);

        // Define the locale file path
        let locFile = require(`${localeDir}${sep}${locale}.json`);

        // If a file does not exist at the specified path, fall back to English (UK) [en-GB]
        if (!locFile[str]) locFile = require(`${localeDir}${sep}en-GB.json`);

        // Return the value of the specified key
        return locFile[str];
    };
};