import { MessageActionRow, MessageButton, Permissions } from "discord.js";

// Basic permissions for the verifiedRole.
// Server admins can change these in Server Settings to meet their requirements.
const verifiedRolePerms = [
    Permissions.FLAGS.VIEW_CHANNEL,
    Permissions.FLAGS.SEND_MESSAGES,
    Permissions.FLAGS.READ_MESSAGE_HISTORY,
    Permissions.FLAGS.USE_APPLICATION_COMMANDS
];

export const run = async (client, interaction) => {   
    // Ensure this command can only be run in the verificationChannel
    if (interaction.channel.name !== interaction.settings.verificationChannel) {
        return interaction.reply({ content: "Not in verificationChannel.", ephemeral: true });
    }

    // Create "Verify" and "Cancel" buttons for this interaction
    const verifyButton = new MessageButton()
        .setCustomId("verify")
        .setLabel("Verify")
        .setStyle("PRIMARY");

    const cancelButton = new MessageButton()
        .setCustomId("cancel")
        .setLabel("Cancel")
        .setStyle("SECONDARY");

    const row = new MessageActionRow()
        .addComponents([verifyButton, cancelButton]);

    await interaction.reply({ content: "Click the verify button to gain access to this server:", components: [row], ephemeral: true });

    const filter = i => ["verify", "cancel"].includes(i.customId) && i.user.id === interaction.user.id;
    const collector = interaction.channel.createMessageComponentCollector({ filter, time: 30000, idle: 30000, dispose: true });
    collector.on("collect", async i => {
        // If cancel button is clicked
        if (i.customId === "cancel") await i.update({ content: "Verification cancelled. Use `/verify` to start again.", components: [] });

        // If verify button is clicked
        if (i.customId === "verify") {
            // Find the "_unverified_user" role
            const unverifiedRole = client.findRoleByName(interaction.guild, "_unverified_user");

            // If the guild member has the "_unverified_user" role, remove the role
            if (interaction.member.roles.cache.find(r => r === unverifiedRole)) {
                try {
                    await interaction.member.roles.remove(unverifiedRole);
                } catch (err) {
                    await i.deferUpdate();
                    await i.editReply(`An error occurred: ${err.message}`);
                    return client.logger.error(err);
                }
            }
            
            // Find the verifiedRole
            let verifiedRole = client.findRoleByName(interaction.guild, interaction.settings.verifiedRole);

            // If the verifiedRole does not exist...
            if (!verifiedRole) {
                // Create the role
                try {
                    await interaction.guild.roles.create({
                        name: interaction.settings.verifiedRole,
                        reason: "delet3 verification system",
                        permissions: verifiedRolePerms
                    });

                    // Find the newly created verifiedRole
                    verifiedRole = client.findRoleByName(interaction.guild, interaction.settings.verifiedRole);
                } catch (err) {
                    // TODO: inform server admins (via modlog) that role creation was unsuccessful
                    await i.deferUpdate();
                    await i.editReply(`An error occurred: ${err.message}`);
                    return client.logger.err(err);
                }
            }

            // Give the guild member the verifiedRole
            try {
                await interaction.member.roles.add(verifiedRole);
            } catch (err) {
                await i.deferUpdate();
                await i.editReply(`An error occurred: ${err.message}`);
                return client.logger.error(err);
            }

            // Remove guild member from verification queue
            await client.removeFromVerifQueue(interaction.guild, interaction.user.id);

            await i.deferUpdate();
            await i.editReply({ content: "Verification complete! You should no longer have access to this channel.", components: [] } );
        }
    });
};

export const data = {
    name: "verify",
    description: "Verify yourself to gain access to more channels and content on this server",
    options: [],
    defaultPermission: true
};

export const global = false;  // TODO: deploy
