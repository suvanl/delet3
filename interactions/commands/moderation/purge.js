import { stripIndents } from "common-tags";
import { ActionRowBuilder, ApplicationCommandOptionType, BitField, ButtonBuilder, ButtonStyle, PermissionsBitField } from "discord.js";

export const run = async (client, interaction) => {
    const amount = interaction.options.getInteger("amount");

    // If amount is too low, reply with error message:
    //  ❌ Error: amount must be at least 1
    if (amount < 1) return interaction.reply({
        content:`<:x_:688400118327672843> **${client.l10n(interaction, "general.error.word")}**: ${mod.purge.amountTooLow}`,
        ephemeral: true
    });

    const btnDelete = new ButtonBuilder()
        .setCustomId("btnDelete")
        .setLabel(client.l10n(interaction, "mod.purge.btn.delete").replace(/%num%/g, amount))
        .setStyle(ButtonStyle.Danger);

    const btnCancel = new ButtonBuilder()
        .setCustomId("btnCancel")
        .setLabel(client.l10n(interaction, "general.btn.cancel"))
        .setStyle(ButtonStyle.Secondary);

    const row = new ActionRowBuilder().addComponents([btnCancel, btnDelete]);

    // Map object for replacing both %num% and %channel% in warningMsg (specifically the "mod.purge.warning.text" string)
    const mapObj = { "%num%": amount, "%channel%": interaction.channel };

    // Define warning message:
    //  ⚠ **Proceed with caution**
    //  Are you sure you want to delete %num% messages in %channel%? This action is **__irreversible__** and **__cannot__** be undone!
    const warningMsg = stripIndents`
        ⚠ **${client.l10n(interaction, "mod.purge.warning.header")}**
        ${client.l10n(interaction, "mod.purge.warning.text").replace(/%num%|%channel%/g, matched => mapObj[matched])}
    `;

    // Respond with warning message and "Cancel" and "Delete x messages" buttons
    const res = await interaction.reply({ content: warningMsg, components: [row], ephemeral: true });

    // Define the filter function for the collector and create the collector
    const filter = i => ["btnCancel", "btnDelete"].includes(i.customId) && i.user.id === interaction.user.id;
    const collector = res.createMessageComponentCollector({ filter, time: 30000, idle: 30000, dispose: true });
    
    // Listen for "collect" event
    collector.on("collect", async i => {
        if (i.customId === "btnCancel") {
            collector.stop("User cancelled");

            // "ℹ Operation cancelled"
            return await i.update({ content: `ℹ ${client.l10n(interaction, "general.cancelled")}`, components: [], ephemeral: true });
        }

        if (i.customId === "btnDelete") {
            collector.stop();
            
            try {
                // Content: "🔄 Deleting %num% messages..."
                await interaction.editReply({
                    content: `🔄 ${client.l10n(interaction, "mod.purge.deleting").replace(/%num%/g, amount)}`,
                    components: [],
                    ephemeral: true
                });

                // Delete the specified number of messages
                const del = await interaction.channel.bulkDelete(amount);

                // Map object for replacing both %num% and %channel% in warningMsg (specifically the "mod.purge.warning.text" string)
                const mapObj = { "%num%": del.size, "%channel%": interaction.channel };

                // Content: "✅ Successfully deleted %num% messages in %channel%"
                return await i.update({
                    content: `<:tick:688400118549970984> ${client.l10n(interaction, "mod.purge.success").replace(/%num%|%channel%/g, m => mapObj[m])}`,
                    components: [],
                    ephemeral: true
                });

                // TODO: inform modlog?
            } catch (err) {
                client.logger.error(err);
                return await interaction.editReply({
                    content: `<:x_:688400118327672843> **${client.l10n(interaction, "error")}**\n${err.message}`,
                    components: [],
                    ephemeral: true
                });
            }
        }
    });
};

export const data = {
    name: "purge",
    description: "Bulk-delete messages in this channel that are from less than two weeks ago",
    options: [{
        name: "amount",
        type: ApplicationCommandOptionType.Integer,
        description: "The number of messages to delete",
        required: true
    }],
    default_member_permissions: new BitField((PermissionsBitField.Flags.ManageMessages).toString()),
    dm_permission: false
};

export const global = true;
