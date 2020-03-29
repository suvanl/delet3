const fetch = require("node-fetch");

module.exports = client => {
    // Send GET request to API for a single user's data
    client.getUser = async user => {
        const url = `${process.env.URL}/users/${user.id}`;
        try {
            const secret = await client.genSecret();
            const res = await fetch(url, {
                method: "get",
                headers: { "Authorization": `jwt ${secret.token}` }
            });
            
            const data = await res.json();
            return data[0];
        } catch (err) {
            return client.logger.err(`error in getUser:\n${err.stack}`);
        }
    };
};