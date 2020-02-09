const fetch = require("node-fetch");
const { BASE_URL } = process.env;

module.exports = client => {
    client.getSettings = async (guild) => {
        const { body } = await fetch(`${BASE_URL}/guilds/${guild.id || "0"}`);
        return body;
    };
};