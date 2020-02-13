const fetch = require("node-fetch");

module.exports = client => {
    // Generate secret
    const genSecret = async () => {
        try {
            const url = new URL("/auth", "http://localhost:3000");
            const body = { "email": process.env.DB_EMAIL, "password": process.env.DB_PASS };
    
            const res = await fetch(url, {
                method: "post",
                body: JSON.stringify(body),
                headers: { "Content-Type": "application/json" }
            });

            const data = await res.json();
            return data;
        } catch (err) {
            client.logger.err(err.stack);
        }
    };


    // GET request to API for guild-specific settings
    client.getSettings = async (guild) => {
        const url = `${process.env.URL}/guilds/${guild.id}`;
        try {
            const secret = await genSecret();
            const res = await fetch(url, {
                method: "get",
                headers: { "Authorization": `jwt ${secret.token}`, "Accept": "application/json" }
            });
            
            const data = await res.json();
            return data[0].settings;
        } catch (err) {
            return client.logger.err(`error in getSettings:\n${err.stack}`);
        }
    };
};