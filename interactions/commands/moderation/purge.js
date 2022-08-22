import { stripIndents } from "common-tags";
import { ActionRowBuilder, ApplicationCommandOptionType, BitField, ButtonBuilder, ButtonStyle, PermissionsBitField } from "discord.js";

export const run = async (client, interaction) => {
    const amount = interaction.options.getInteger("amount");
    if (amount < 1) return interaction.reply({ content: "<:x_:688400118327672843> **Error**: amount must be at least 1", ephemeral: true });

    const btnDelete = new ButtonBuilder()
        .setCustomId("btnDelete")
        .setLabel(`Delete ${amount} messages`)
        .setStyle(ButtonStyle.Danger);

    const btnCancel = new ButtonBuilder()
        .setCustomId("btnCancel")
        .setLabel("Cancel")
        .setStyle(ButtonStyle.Secondary);

    const row = new ActionRowBuilder().addComponents([btnCancel, btnDelete]);

    const warningMsg = stripIndents`
        ⚠ **Proceed with caution**
        Are you sure you want to delete ${amount} messages in ${interaction.channel}? This action is **__irreversible__** and **__cannot__** be undone!
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
            return await i.update({ content: "ℹ Operation cancelled", components: [], ephemeral: true });
        }

        if (i.customId === "btnDelete") {
            collector.stop();
            
            try {
                await interaction.editReply({ content: `🔄 Deleting **${amount}** messages...`, components: [], ephemeral: true });
                const del = await interaction.channel.bulkDelete(amount);
                await i.update({
                    content: `<:tick:688400118549970984> Successfully deleted **${del.size}** messages in ${interaction.channel}`,
                    components: [],
                    ephemeral: true
                });
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
