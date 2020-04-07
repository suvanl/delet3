const fetch = require("node-fetch");

module.exports = client => {
    // Send GET request to API for guild-specific settings
    client.getSettings = async guild => {
        const url = `${process.env.URL}/guilds/${guild ? guild.id : "1234567890"}`;
        try {
            const secret = await client.genSecret();
            const res = await fetch(url, {
                method: "get",
                headers: { "Authorization": `jwt ${secret.token}` }
            });
            
            const data = await res.json();
            return data[0].settings;
        } catch (err) {
            return client.logger.err(`error in getSettings:\n${err.stack}`);
        }
    };
};