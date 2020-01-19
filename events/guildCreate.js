const { blue, cyan } = require("chalk");

module.exports = (client, guild) => {
    client.logger.inf(`${blue("guildCreate")}: "${cyan(guild.name)}" (${guild.id}) | owner: ${cyan(guild.owner.user.tag)} (${guild.owner.user.id})`);
};
