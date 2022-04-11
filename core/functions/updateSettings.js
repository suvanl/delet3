import fetch from "node-fetch";

export default client => {
    // Send PUT request to API to update guild-specific settings
    client.updateSettings = async (guild, setting, newValue) => {
        // Request params
        const url = `${process.env.URL}/guilds/${guild.id}`;
        const secret = await client.genSecret();

        // Get all current settings
        const current = await fetch(url, {
            method: "get",
            headers: { "Authorization": `jwt ${secret.token}` }
        });

        // Parse as JSON
        const json = await current.json();
        const data = json[0].settings;

        // Set new value on selected settings key
        data[setting] = newValue;

        // PUT request specific params
        const body = { "settings": data };
        const meta = { "Authorization": `jwt ${secret.token}`, "Content-Type": "application/json" };

        try {
            const res = await fetch(url, {
                method: "PUT",
                body: JSON.stringify(body),
                headers: meta
            });

            return res.status;
        } catch (err) {
            return client.logger.err(`error in updateSettings:\n${err.stack}`);
        }
    };
};