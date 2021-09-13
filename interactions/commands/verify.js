const { MessageActionRow, MessageButton } = require("discord.js");

exports.run = async (client, interaction) => {    
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
            // todo: verification process

            await i.deferUpdate();
            await i.editReply({ content: "Verification Complete!", components: []} );
        }
    });
};

exports.data = {
    name: "verify",
    description: "Verify yourself to gain access to more channels on this server",
    options: [],
    defaultPermission: true
};

exports.global = false;