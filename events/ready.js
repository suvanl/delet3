import chalk from "chalk";
import pkg from "../package.json";
import { ActivityType } from "discord.js";

const { version: ver } = pkg;
const { NODE_ENV: env } = process.env;

export default async client => {
    client.user.setActivity(env.toLowerCase() == "production" ? `liftoff@v${ver} 🚀` : `dev_build_${ver}`, { type: ActivityType.Watching });
    client.logger.log(`${chalk.green(client.user.tag)} | ${chalk.green(client.users.cache.size - 1)} users | ${chalk.green(client.guilds.cache.size)} servers`, "ready");

    if (process.argv.includes("--deploy")) await client.deployApplicationCommand(client);
};