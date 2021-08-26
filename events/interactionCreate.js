const { magenta: mag } = require("chalk");

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

    // Get user/member's permLevel
    const level = client.permLevel(interaction);

    try {
        // Run the slash command
        await slashCmd.run(client, interaction, level);

        // Log use of the slash command
        const log = `${client.permLevels.levels.find(l => l.level === level).name} ${mag(interaction.user.tag)} (${interaction.user.id}) ran ApplicationCommand ${mag(slashCmd.data.name)}`;
        client.logger.app(log);
    } catch (err) {
        // Log the error
        client.logger.err(err.stack);

        // If the interaction has already been replied to, send a follow-up message informing the user that an error occurred
        if (interaction.replied) interaction.followUp({ content: `${client.l10n(interaction, "error")} ${err.message}`, ephemeral: true });
        
        // Otherwise, send a reply
        else interaction.reply({ content: `${client.l10n(interaction, "error")} ${err.message}`, ephemeral: true });
    }
};