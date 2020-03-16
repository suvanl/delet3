const { blue, cyan } = require("chalk");
const fetch = require("node-fetch");

module.exports = async (client, guild) => {
    // Delete guild data from database
    const secret = await client.genSecret();
    const url = `${process.env.URL}/guilds/${guild.id}`;
    
    try {
        await fetch(url, {
            method: "delete",
            headers: { "Authorization": `jwt ${secret.token}` }
        });
    } catch (err) {
        return client.logger.err(`Error deleting guild data:\n${err.stack}`);
    }

    // Log name/ID of guild
    client.logger.inf(`${blue("guildDelete")}: "${cyan(guild.name)}" (${guild.id})`);
};
