import chalk from "chalk";
import { InteractionType } from "discord.js";

export default async (client, interaction) => {
    // Get data associated with the application command
    // More info: https://discord.js.org/#/docs/main/stable/typedef/ApplicationCommandData
    const appCmd = client.applicationCommands.get(interaction.commandName);

    // Return if no application command with the provided name exists in the collection
    if (!appCmd) return;

    // Fetch guild/default settings from REST API
    interaction.settings = await client.getSettings(interaction.guild);

    // Prevent interactions from being used in the verificationChannel (except the /verify command)
    if (interaction.channel.name === interaction.settings.verificationChannel && interaction.commandName !== "verify") {
        return interaction.reply({ content: "Only the `/verify` command can be used in the verification channel.", ephemeral: true });
    }

    // Get user/member's permLevel
    const level = client.permLevel(interaction);

    try {
        // Run the slash command
        interaction.type === InteractionType.ApplicationCommand ? await appCmd.run(client, interaction, level) : await appCmd.run(client, interaction);

        // Log use of the slash command
        const log = `${client.permLevels.levels.find(l => l.level === level).name} ${chalk.magenta(interaction.user.tag)} (${interaction.user.id}) ran ApplicationCommand ${chalk.magenta(appCmd.data.name)}`;
        client.logger.app(log);
    } catch (err) {
        // Log the error
        client.logger.error(err.stack);

        // If the interaction has already been replied to, send a follow-up message informing the user that an error occurred
        if (interaction.replied) interaction.followUp({ content: `${client.l10n(interaction, "error")} ${err.message}`, ephemeral: true });
        
        // Otherwise, send a reply
        else interaction.reply({ content: `${client.l10n(interaction, "error")} ${err.message}`, ephemeral: true });
    }
};