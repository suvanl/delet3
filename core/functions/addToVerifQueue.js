import fetch from "node-fetch";
import { DateTime } from "luxon";

export default client => {
    client.addToVerifQueue = async (guild, userID) => {
        // Define request parameters
        const url = `${process.env.URL}/guilds/${guild.id}`;
        const secret = await client.genSecret();
        const meta = { "Content-Type": "application/json", "Authorization": `jwt ${secret.token}` };

        // Define punishment start/end timestamps
        const joinedTimestamp = DateTime.now().toUnixInteger();  // current time

        // Fetch guild data
        const guildData = await client.getGuild(guild);
        
        // Push to existing queue
        const queue = guildData.verificationQueue.users;
        queue.push({ id: userID, joinedTimestamp });

        // Request body
        const body = {
            "verificationQueue": {
                users: queue
            }
        };

        // Send PUT request
        try {
            await fetch(url, {
                method: "PUT",
                body: JSON.stringify(body),
                headers: meta
            });
        } catch (err) {
            return client.logger.error(`error in addToVerifQueue:\n${err.stack}`);
        }

    };
};