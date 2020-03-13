const { blue, cyan } = require("chalk");
const fetch = require("node-fetch");

module.exports = async (client, guild) => {
    const secret = await client.genSecret();

    // Prevent new guild data being added if the guild already exists in database (this shouldn't happen in production anyway)
    if (client.getSettings(guild)) return client.logger.wrn(`${guild.name} already exists in database`);

    // Store guild data with default settings in database
    const url = `${process.env.URL}/guilds`;
    const body = { "guildID": parseInt(guild.id), name: guild.name };
    const meta = { "Content-Type": "application/json", "Authorization": `jwt ${secret.token}` };

    try {
        await fetch(url, {
            method: "post",
            body: JSON.stringify(body),
            headers: meta
        });

        // TODO: save data of all guild members (to be used in points/trivia points systems) [maybe do this in the trivia command itself]
        // TODO: find a way to save new guild data if the bot was added to a guild whilst offline (maybe run this same logic on the message event, if guildID does not exist in db)
        // TODO: maybe check for errors based on response status code? e.g. this POST request should respond with a 201 code
    } catch (err) {
        return client.logger.err(`Error saving new guild data:\n${err.stack}`);
    }

    // Log guild name/ID and owner name/ID
    client.logger.inf(`${blue("guildCreate")}: "${cyan(guild.name)}" (${guild.id}) | owner: ${cyan(guild.owner.user.tag)} (${guild.owner.user.id})`);
};
