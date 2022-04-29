import fetch from "node-fetch";

export default client => {
    client.removeFromVerifQueue = async (guild, userID) => {
        // Define request parameters
        const url = `${process.env.URL}/guilds/${guild.id}`;
        const secret = await client.genSecret();
        const meta = { "Content-Type": "application/json", "Authorization": `jwt ${secret.token}` };

        // Fetch guild data
        const guildData = await client.getGuild(guild);
        
        // Existing queue
        const queue = guildData.verificationQueue.users;

        // Check if the userID exists in the queue
        if (queue.some(e => e.id === userID)) {
            // Create a new array without the current user in it
            const newQueue = queue.filter(e => e.id !== userID);

            // Request body
            const body = { "verificationQueue": { users: newQueue } };

            // Send PUT request
            try {
                await fetch(url, {
                    method: "PUT",
                    body: JSON.stringify(body),
                    headers: meta
                });
            } catch (err) {
                return client.logger.error(`error in removeFromVerifQueue:\n${err.stack}`);
            }
        }
    };
};