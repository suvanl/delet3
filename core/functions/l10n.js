const { readdirSync } = require("fs");
const { sep } = require("path");
const localeDir = `${process.cwd()}${sep}core${sep}locales`;

module.exports = client => {
    // Localisation (l10n)
    // Language tag list: https://w.wiki/Lsd
    client.l10n = (message, str, locale = message.settings.language) => {
        const localeFiles = readdirSync(localeDir);
        const lf = localeFiles.map(file => file.split(".")[0]);
        if (!lf.includes(locale)) return client.logger.err(`Missing locale file: "${locale}"`);

        const locFile = require(`${localeDir}${sep}${locale}.json`);
        return locFile[str];
    };
};