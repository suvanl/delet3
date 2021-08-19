module.exports = async (client, interaction) => {
    // Return if the interaction is not a CommandInteraction
    // More info: https://discord.js.org/#/docs/main/stable/class/CommandInteraction
    if (!interaction.isCommand()) return;

    // Get data associated with the slash command (name, description, etc)
    // More info: https://discord.js.org/#/docs/main/stable/typedef/ApplicationCommandData
    const slashCmd = client.slashCommands.get(interaction.commandName);

    // Return if no slash command with that name exists
    if (!slashCmd) return;

    // Fetch guild/default settings from REST API
    interaction.settings = await client.getSettings(interaction.guild);

    // Run the slash command
    try {
        await slashCmd.run(client, interaction);
    } catch (err) {
        // Log the error
        client.logger.err(err);

        // If the interaction has already been replied to, send a follow-up message informing the user that an error occurred
        // TODO: localise the `content` string
        if (interaction.replied) interaction.followUp({ content: `An error occurred:\n${err.message}`, ephemeral: true });
        
        // Otherwise, send a reply
        else interaction.reply({ content: `An error occurred:\n${err.message}`, ephemeral: true });
    }
};