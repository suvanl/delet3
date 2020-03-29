const fetch = require("node-fetch");

module.exports = client => {
    // Add points to a user object (can be of type "triviaPoints" or "points")
    client.addPoints = async (user, type, amount) => {
        const url = `${process.env.URL}/users/${user.id}`;
        const body = { [type]: amount };

        const secret = await client.genSecret();
        const meta = { "Content-Type": "application/json", "Authorization": `jwt ${secret.token}` };

        try {
            await fetch(url, {
                method: "PUT",
                body: JSON.stringify(body),
                headers: meta
            });
        } catch (err) {
            return client.logger.err(`error in addPoints:\n${err.stack}`);
        }
    };
};