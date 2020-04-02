const fetch = require("node-fetch");

module.exports = client => {
    // Send PUT request to API to update guild-specific settings
    client.getSettings = async (guild, setting, newValue) => {
        const url = `${process.env.URL}/guilds/${guild.id}`;
        const body = { "settings": { [setting]: newValue } };

        const secret = await client.genSecret();
        const meta = { "Content-Type": "application/json", "Authorization": `jwt ${secret.token}` };

        try {
            await fetch(url, {
                method: "PUT",
                body: JSON.stringify(body),
                headers: meta
            });
        } catch (err) {
            return client.logger.err(`error in updateSettings:\n${err.stack}`);
        }
    };
};