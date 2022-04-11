import chalk from "chalk";
const ver = import("../package.json").then(pkg => pkg.version);
const { NODE_ENV: env } = process.env;

export default async client => {
    client.logger.log(`${chalk.green(client.user.tag)} | ${chalk.green(client.users.cache.size - 1)} users | ${chalk.green(client.guilds.cache.size)} servers`, "rdy");
    client.user.setActivity(env.toLowerCase() == "production" ? `liftoff@v${ver} 🚀` : `[dev_build_${ver}]`, { type: "WATCHING" });

    if (process.argv.includes("--deploy")) await client.deploySlashCommand(client);
};