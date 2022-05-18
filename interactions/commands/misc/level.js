import { stripIndents } from "common-tags";

export const run = async (client, interaction, level) => {
    const lvlName = client.permLevels.levels.find(l => l.level === level).name;
    const content = stripIndents`
        ${client.l10n(interaction, "level.lvl").replace(/%lvl%/g, `\`${level}\` (**${lvlName}**)`)}
        ${client.l10n(interaction, "level.info").replace(/%cmd%/g, `\`${interaction.settings.prefix}help\``)}`;

    return interaction.reply({ content, ephemeral: true });
};

export const data = {
    name: "level",
    description: "Shows your permission level on the current server",
    options: [],
    defaultPermission: true,
    dm_permission: false
};

export const global = true;