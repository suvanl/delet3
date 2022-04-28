import fetch from "node-fetch";
import { DateTime } from "luxon";

export default client => {
    // Add a punishment to the activePunishments object within the Guild object
    client.addPunishment = async (type, guild, userID, issuerID, reason, duration) => {
        // Define request parameters
        const url = `${process.env.URL}/guilds/${guild.id}`;
        const secret = await client.genSecret();
        const meta = { "Content-Type": "application/json", "Authorization": `jwt ${secret.token}` };

        // Define punishment start/end timestamps
        const issuedTimestamp = DateTime.now().toUnixInteger();  // current time
        const endTimestamp = issuedTimestamp + duration;

        // Request body
        const body = {
            "activePunishments": {
                [type]: [
                    {
                        userID,
                        issuerID,
                        reason,
                        issuedTimestamp,
                        endTimestamp
                    }
                ]
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
            return client.logger.error(`error in addPunishment:\n${err.stack}`);
        }
    };
};