import chalk from "chalk";
import fetch from "node-fetch";

export default async (client, guild) => {
    // Request parameters
    const secret = await client.genSecret();
    const url = `${process.env.URL}/guilds/${guild.id}`;
    const meta = { "Authorization": `jwt ${secret.token}` };
    
    // Delete guild data from DB
    try {
        await fetch(url, {
            method: "delete",
            headers: meta
        });
    } catch (err) {
        return client.logger.err(`Error deleting guild data:\n${err.stack}`);
    }

    // Fetch all users
    const all = await client.getUsers();

    // Filter out users who aren't in this guild
    const filtered = all.filter(a => a.guildID === guild.id);

    // Delete guild users from DB
    filtered.forEach(async e => {
        // Define delete request params
        const userUrl = `${process.env.URL}/users/${e._id}`;
        try {
            await fetch(userUrl, {
                method: "delete",
                headers: meta
            });
        } catch (err) {
            return client.logger.err(`Error deleting guild user data:\n${err.stack}`);
        }
    });
    
    // Log name/ID of guild
    client.logger.inf(`${chalk.blue("guildDelete")}: "${chalk.cyan(guild.name)}" (${guild.id})`);
};
