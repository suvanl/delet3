const { blue, cyan } = require("chalk");
const fetch = require("node-fetch");

module.exports = async (client, guild) => {
    const secret = await client.genSecret();

    // Store guild data with default settings in database
    const url = `${process.env.URL}/guilds`;
    const body = { "guildID": guild.id, "name": guild.name };
    const meta = { "Content-Type": "application/json", "Authorization": `jwt ${secret.token}` };
    
    try {
        await fetch(url, {
            method: "post",
            body: JSON.stringify(body),
            headers: meta
        });

        // TODO: find a way to save new guild data if the bot was added to a guild whilst offline (maybe run this same logic on the message/ready event, if guildID does not exist in db)
    } catch (err) {
        return client.logger.err(`Error saving new guild data:\n${err.stack}`);
    }

    // Store guild's user IDs in database
    const userUrl = `${process.env.URL}/users`;

    const members = guild.members.cache.map(m => m.user.id);
    members.forEach(async id => {
        const userBody = { "userID": id, "guildID": guild.id };
        try {
            await fetch(userUrl, {
                method: "post",
                body: JSON.stringify(userBody),
                headers: meta
            });
        } catch (err) {
            return client.logger.err(`Error saving new user data:\n${err.stack}`);
        }
    });

    // Log guild name/ID and owner tag/ID
    client.logger.inf(`${blue("guildCreate")}: "${cyan(guild.name)}" (${guild.id}) | owner: ${cyan(guild.owner.user.tag)} (${guild.owner.user.id})`);
};
