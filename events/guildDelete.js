const { blue, cyan } = require("chalk");

module.exports = (client, guild) => {
    client.logger.inf(`${blue("guildDelete")}: "${cyan(guild.name)}" (${guild.id})`);

    // TODO: erase guild data
};
