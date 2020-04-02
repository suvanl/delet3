const fetch = require("node-fetch");

module.exports = client => {
    // Send PUT request to API to update guild-specific settings
    client.updateSettings = async (guild, setting, newValue) => {
        const url = `${process.env.URL}/guilds/${guild.id}`;
        const body = { "settings": { [setting]: newValue } };

        const secret = await client.genSecret();
        const meta = { "Content-Type": "application/json", "Authorization": `jwt ${secret.token}` };

        try {
            const res = await fetch(url, {
                method: "PUT",
                body: JSON.stringify(body),
                headers: meta
            });

            return res.status;
        } catch (err) {
            return client.logger.err(`error in updateSettings:\n${err.stack}`);
        }
    };
};