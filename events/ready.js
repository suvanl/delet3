const { green } = require("chalk");
const ver = require("../package.json").version;
const { NODE_ENV: env } = process.env;

module.exports = async client => {
    client.logger.log(`${green(client.user.tag)} | ${green(client.users.cache.size - 1)} users | ${green(client.guilds.cache.size)} servers`, "rdy");
    client.user.setActivity(env.toLowerCase() == "production" ? `liftoff@v${ver} 🚀` : `[dev_build_${ver}]`, { type: "WATCHING" });

    if (process.argv.includes("--deploy")) await client.deploySlashCommand(client);
};