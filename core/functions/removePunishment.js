import fetch from "node-fetch";

export default client => {
    // Remove a punishment from the activePunishments object within the Guild object
    client.removePunishment = async (type, guild, userID) => {
        // Define request parameters
        const url = `${process.env.URL}/guilds/${guild.id}`;
        const secret = await client.genSecret();
        const meta = { "Content-Type": "application/json", "Authorization": `jwt ${secret.token}` };

        // Get current guild data
        const currentGuild = await client.getGuild(guild);

        // Get type (e.g. "bans", which is an array of objects) from within activePunishments object from guild data
        const punishmentData = currentGuild.activePunishments[type];

        // Get the index of the specified user's punishment
        const index = punishmentData.findIndex(obj => obj.userID === userID);

        // Define newData variable (will be given a value if the following if statement is true)
        let newData;

        // If the returned index is not -1...
        if (index !== -1) {
            // Remove the element (object) with the specified index from the array
            newData = [
                ...punishmentData.slice(0, index),
                ...punishmentData.slice(index + 1)
            ];
        } else return client.logger.error(`error in removePunishment: could not find a punishment in "${type}" relating to the specified ID (${userID})`);


        // Request body
        const body = { "activePunishments": { [type]: newData } };

        // Send PUT request
        try {
            await fetch(url, {
                method: "PUT",
                body: JSON.stringify(body),
                headers: meta
            });
        } catch (err) {
            return client.logger.error(`error in removePunishment:\n${err.stack}`);
        }
    };
};