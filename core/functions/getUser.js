export default client => {
    // Send GET request to API for a single user's data
    client.getUser = async (guild, user) => {
        // Fetch all users
        const all = await client.getUsers();
        
        // Filter out users who aren't in this guild
        const f = all.filter(a => a.guildID === guild.id);

        // Find user by user ID
        const u = f.filter(u => u.userID === user.id);
        return u[0];
    };
};