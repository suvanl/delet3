import fetch from "node-fetch";
import { DateTime } from "luxon";

export default client => {
    // Add points to a user object (can be of type "triviaPoints" or "points")
    client.addPoints = async (guild, user, type, amount) => {
        // Fetch all users
        const all = await client.getUsers();

        // Filter out users who aren't in this guild
        const f = all.filter(a => a.guildID === guild.id);

        // Find user
        const u = f.filter(u => u.userID === user.id);

        // Define params for PUT request
        const url = `${process.env.URL}/users/${u[0]._id}`;
        const body = { [type]: amount, "pointsUpdatedTimestamp": DateTime.now().toUnixInteger() };

        const secret = await client.genSecret();
        const meta = { "Content-Type": "application/json", "Authorization": `jwt ${secret.token}` };

        // Send PUT request
        try {
            await fetch(url, {
                method: "PUT",
                body: JSON.stringify(body),
                headers: meta
            });
        } catch (err) {
            return client.logger.error(`error in addPoints:\n${err.stack}`);
        }
    };
};