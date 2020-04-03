const fetch = require("node-fetch");

module.exports = async (client, member) => {
    // Delete guildMember's data from DB
    const secret = await client.genSecret();
    const url = `${process.env.URL}/users/${member.user.id}`;

    try {
        await fetch(url, {
            method: "delete",
            headers: { "Authorization": `jwt ${secret.token}` }
        });
    } catch (err) {
        return client.logger.err(`Error deleting guildMember:\n${err.stack}`);
    }
};