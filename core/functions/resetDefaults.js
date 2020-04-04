const fetch = require("node-fetch");

module.exports = client => {
    // Send GET request to API for guild-specific settings
    client.resetDefaults = async guild => {
        const secret = await client.genSecret();
        const delUrl = `${process.env.URL}/guilds/${guild.id}`;

        // Delete guild data from database
        try {
            await fetch(delUrl, {
                method: "delete",
                headers: { "Authorization": `jwt ${secret.token}` }
            });
        } catch (err) {
            return client.logger.err(`error in resetDefaults:\n${err.stack}`);
        }

        // URL to send POST request to
        const saveUrl = `${process.env.URL}/guilds`;
        const body = { "guildID": guild.id, name: guild.name };

        // Re-save guild with default settings
        try {
            const res = await fetch(saveUrl, {
                method: "post",
                body: JSON.stringify(body),
                headers: { "Content-Type": "application/json", "Authorization": `jwt ${secret.token}` }
            });
            return res.status;
        } catch (err) {
            return client.logger.err(`error in restDefaults:\n${err.stack}`);
        }
    };
};