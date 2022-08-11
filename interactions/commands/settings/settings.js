import {
    ActionRowBuilder,
    ApplicationCommandOptionType,
    BitField,
    ButtonBuilder,
    ButtonStyle,
    InteractionType,
    ModalBuilder,
    PermissionsBitField,
    SelectMenuBuilder,
    TextInputBuilder,
    TextInputStyle
} from "discord.js";

import { DISCORD_LOCALES as DL } from "../../../core/util/constants";
import { langName, validLangs } from "../../../core/util/data";
import locales from "../../../core/locales";

const EXPIRATION_TIME = 60000;  // 60 seconds

export const run = async (client, interaction) => {
    const setting = interaction.options.getString("setting");

    // Create "Change" button
    const btnChange = new ButtonBuilder()
        .setCustomId("btnChange")
        .setLabel("Change")
        .setStyle(ButtonStyle.Primary);

    // Create "Cancel" button
    const btnCancel = new ButtonBuilder()
        .setCustomId("btnCancel")
        .setLabel("Cancel")
        .setStyle(ButtonStyle.Secondary);

    const initRow = new ActionRowBuilder().addComponents([btnChange, btnCancel]);
    
    // Reply with current value of setting and ask user if they want to change it
    const res = await interaction.reply({
        content: `**${setting.toTitleCase()}**: ${interaction.settings[setting]}`,
        components: [initRow],
        ephemeral: true
    });

    const filter = i => ["btnChange", "btnCancel"].includes(i.customId) && i.user.id === interaction.user.id;
    const collector = res.createMessageComponentCollector({ filter, time: EXPIRATION_TIME, idle: EXPIRATION_TIME, dispose: true });

    // Listen for the "collect" event
    collector.on("collect", async i => {
        if (i.customId === "btnCancel") return await handleCancel(client, collector, i, interaction);

        if (i.customId === "btnChange") {          
            if (setting === "language") {
                // Get options for select menu
                const options = [];
                validLangs.forEach(lang => {
                    options.push({ label: langName[lang], description: lang, value: lang });
                });

                // Create select menu with available locales as options
                const selectMenu = new SelectMenuBuilder()
                    .setCustomId("selectLanguage")
                    .setPlaceholder("Select a language for this server's text commands")
                    .addOptions(options);

                // Create and send action rows
                const row1 = new ActionRowBuilder().addComponents([selectMenu]);
                const row2 = new ActionRowBuilder().addComponents([btnCancel]);
                const res = await i.editReply({ content: "🗺️ Select a language from the list", components: [row1, row2], ephemeral: true });

                const filter = i => i.customId === "selectLanguage" && i.user.id === interaction.user.id;
                const collector = res.createMessageComponentCollector({ filter, time: EXPIRATION_TIME, idle: EXPIRATION_TIME, dispose: true });
                collector.on("collect", async i => {
                    if (i.customId === "btnCancel") return await handleCancel(client, collector, i, interaction);

                    const selected = i.values[0];

                    // Update the language setting
                    try {
                        const update = await client.updateSettings(interaction.guild, "language", selected);
                        if (update === 200) return i.update({
                            content: `<:tick:688400118549970984> Language successfully changed to **${langName[selected]}**.`,
                            components: [],
                            ephemeral: true
                        });
                    } catch (err) {
                        client.logger.error(`Error changing language:\n${err.stack}`);
                        return await i.update({
                            content: `Error changing language:\n${err.stack}`,
                            components: [],
                            ephemeral: true
                        });
                    }

                    return collector.stop("Success");
                });
            }

            // Create text input component for modal
            const input = new TextInputBuilder()
                .setCustomId("inputModal")
                .setLabel(`New value for ${setting}`)
                .setStyle(TextInputStyle.Short)
                .setMaxLength(128)
                .setRequired(true);

            // Create action row for modal
            const row = new ActionRowBuilder().addComponents([input]);

            // Create and show modal
            const modal = new ModalBuilder()
                .setTitle(`Change ${setting.toTitleCase()}`)
                .setCustomId(`${setting}Modal`)
                .addComponents([row]);
            
            i.showModal(modal);

            try {
                const filter = i => i.type === InteractionType.ModalSubmit && i.user.id === interaction.user.id;
                const sub = await i.awaitModalSubmit({ filter, time: EXPIRATION_TIME });
                const newValue = sub.fields.getTextInputValue("inputModal");

                // Update setting value
                const update = await client.updateSettings(interaction.guild, "prefix", newValue);
                if (update === 200) {
                    sub.reply({
                        content: `<:tick:688400118549970984> ${setting.toTitleCase()} successfully changed to **${newValue}**.`,
                        components: [],
                        ephemeral: true
                    });
                }

                collector.stop("Success");
            } catch (err) {
                const reasonTime = err.message === "Collector received no interactions before ending with reason: time";
                const content = reasonTime ? "<:x_:688400118327672843> Timed out" : `<:x_:688400118327672843> ${client.l10n(interaction, "settings.error")}`;

                if (!reasonTime) client.logger.error(err);
                return await i.editReply({ content, components: [], ephemeral: true });
            }
        }

        collector.stop("Default");
    });
};

const handleCancel = async (client, collector, i, interaction) => {
    collector.stop("User cancelled");
    return await i.editReply({ content: client.l10n(interaction, "settings.cancel"), components: [], ephemeral: true });
};

// todo: ensure `name_localizations` actually works
const choiceNameL10n = {
    language: {
        [DL.German]: locales["de-DE"]["settings.language"],
        [DL.EnglishUK]: locales["en-GB"]["settings.language"],
        [DL.EnglishUS]: locales["en-US"]["settings.language"],
        [DL.French]: locales["fr-FR"]["settings.language"],
        [DL.Japanese]: locales["ja-JP"]["settings.language"],
        [DL.Dutch]: locales["nl-NL"]["settings.language"],
        [DL.Norwegian]: locales["no-NO"]["settings.language"],
        [DL.Swedish]: locales["sv-SE"]["settings.language"]
    }
};

export const data = {
    name: "settings",
    description: "View/change delet3's settings for this server. For a more intuitive experience, use the dashboard.",
    options: [{
        name: "setting",
        type: ApplicationCommandOptionType.String,
        description: "The setting to view or change",
        required: true,
        // TODO: add all settings as choices
        // ! it'd be a much better experience if each setting had type restrictions as opposed to everything being a string
        choices: [
            { name: "Language", name_localizations: choiceNameL10n.language, value: "language" },
            { name: "Prefix", value: "prefix" }
        ]
    }],
    default_member_permissions: new BitField((PermissionsBitField.Flags.ManageGuild).toString()),
    dm_permission: false
};

export const global = true;
