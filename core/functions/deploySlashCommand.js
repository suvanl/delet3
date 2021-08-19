const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const { blue } = require("chalk");
const { TOKEN, DEV_GUILD_ID } = process.env;

module.exports = client => {
    client.deploySlashCommand = async client => {
        // Initialise an empty array for non-global slash command data
        const guildCommands = [];

        // Initialise an empty array for global slash command data
        const globalCommands = [];


        // Push each guild-only slash command's data object to the guildCommands array
        client.slashCommands.forEach(cmd => {
            guildCommands.push(cmd.data);
        });

        // Push each global slash command's data object to the globalCommands array
        const global = client.slashCommands.filter(c => c.global);
        global.forEach(cmd => {
            globalCommands.push(cmd.data);
        });
        

        // Initialise a new REST client
        const rest = new REST({ version: "9" }).setToken(TOKEN);

        (async () => {
            try {
                client.logger.inf("Refreshing ApplicationCommands...");

                // Deploy guild-only slash commands
                await rest.put(Routes.applicationGuildCommands(client.user.id, DEV_GUILD_ID), { body: guildCommands });

                // Deploy global slash commands
                await rest.put(Routes.applicationCommands(client.user.id), { body: globalCommands });

                client.logger.inf(`Successfully reloaded ApplicationCommands: ${blue(guildCommands.length)} guild-only; ${blue(globalCommands.length)} global.`);
            } catch (err) {
                client.logger.err(err.stack);
            }
        })();
    };
};