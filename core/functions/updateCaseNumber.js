const fetch = require("node-fetch");

module.exports = client => {
    // Send PUT request to API to update moderation case number
    client.updateCaseNumber = async guild => {
        // Request params
        const url = `${process.env.URL}/guilds/${guild.id}`;
        const secret = await client.genSecret();

        // Get current guild data
        const current = await fetch(url, {
            method: "get",
            headers: { "Authorization": `jwt ${secret.token}` }
        });

        // Parse as JSON
        const json = await current.json();
        const data = json[0];

        // Current case number
        let caseNum = data.caseNumber;

        // Increment case number by 1
        data["caseNumber"] = ++caseNum;

        // PUT request specific params
        const body = { "caseNumber": data.caseNumber };
        const meta = { "Authorization": `jwt ${secret.token}`, "Content-Type": "application/json" };

        try {
            const res = await fetch(url, {
                method: "PUT",
                body: JSON.stringify(body),
                headers: meta
            });

            return res.status;
        } catch (err) {
            return client.logger.err(`error in updateCaseNumber:\n${err.stack}`);
        }
    };
};