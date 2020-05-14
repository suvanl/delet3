const fetch = require("node-fetch");

module.exports = client => {
    // Send GET request to API to fetch single guild data
    client.getGuild = async guild => {
        const url = `${process.env.URL}/guilds/${guild.id}`;
        try {
            const secret = await client.genSecret();
            const res = await fetch(url, {
                method: "get",
                headers: { "Authorization": `jwt ${secret.token}` }
            });
            
            const data = await res.json();
            return data[0];
        } catch (err) {
            return client.logger.err(`error in getGuild:\n${err.stack}`);
        }
    };
};