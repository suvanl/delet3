const { green } = require("chalk");

module.exports = async client => {
    client.logger.log(`${green(client.user.tag)} | ${green(client.users.size)} users | ${green(client.guilds.size)} servers`, "rdy");
    client.user.setActivity("liftoff@v3.0.0 🚀", { type: "WATCHING" });
};