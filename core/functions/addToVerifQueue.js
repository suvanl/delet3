import fetch from "node-fetch";
import { DateTime } from "luxon";

export default client => {
    client.addToVerifQueue = async (guild, userID) => {
        // Define request parameters
        const url = `${process.env.URL}/guilds/${guild.id}`;
        const secret = await client.genSecret();
        const meta = { "Content-Type": "application/json", "Authorization": `jwt ${secret.token}` };

        // Queue entry time
        const joinedTimestamp = DateTime.now().toUnixInteger();  // current time

        // Fetch guild data
        const guildData = await client.getGuild(guild);
        
        // Existing queue
        const queue = guildData.verificationQueue.users;

        // Check if the userID already exists in the queue (and return if so)
        if (queue.some(e => e.id === userID)) {
            return client.logger.warn("addToVerifQueue: an object with the provided user ID already exists in the queue");
        }

        // Push a new object to the existing queue
        queue.push({ id: userID, joinedTimestamp });

        // Request body
        const body = { "verificationQueue": { users: queue } };

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