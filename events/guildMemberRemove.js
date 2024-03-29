import fetch from "node-fetch";

export default async (client, member) => {
    // Attempt to remove the user from the verificationQueue if they are in it
    await client.removeFromVerifQueue(member.guild, member.user.id);

    // Request parameters
    const secret = await client.genSecret();
    const meta = { "Authorization": `jwt ${secret.token}` };
    
    // Fetch all users
    const all = await client.getUsers();

    // Filter out users who aren't in this guild
    const f = all.filter(a => a.guildID === member.guild.id);
    
    // Find guildMember by user ID
    const user = f.filter(u => u.userID === member.user.id);

    // Delete this guildMember from DB (using their unique ObjectId)
    const url = `${process.env.URL}/users/${user[0]._id}`;
    try {
        await fetch(url, {
            method: "delete",
            headers: meta
        });
    } catch (err) {
        return client.logger.error(`Error deleting a user's data (guildMemberRemove)\n${err.stack}`);
    }
};