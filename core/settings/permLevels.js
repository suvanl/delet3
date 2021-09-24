const permLevels = {
    superusers: [],
    
    levels: [
        {
            level: 0,
            name: "User",
            verify: () => true
        },
        {
            level: 2,
            name: "Server Moderator",
            verify: message => {
                try {
                    const modRole = message.guild.roles.cache.find(r => r.name === message.settings.modRole);
                    if (modRole && message.member.roles.cache.has(modRole.id)) return true;
                } catch (err) {
                    return false;
                }
            }
        },
        {
            level: 3,
            name: "Server Admin",
            verify: message => {
                try {
                    const adminRole = message.guild.roles.cache.find(r => r.name === message.settings.adminRole);
                    if (adminRole && message.member.roles.cache.has(adminRole.id)) return true;
                } catch (err) {
                    return false;
                }
            }
        },
        {
            level: 4,
            name: "Server Owner",
            verify: message => {
                try {
                    if (message.channel.type === "GUILD_TEXT")
                        if (message.guild.ownerId === (message.author?.id || message.user?.id)) return true;
                } catch (err) {
                    return false;
                }
            }
        },
        {
            level: 6,
            name: "Superuser",
            verify: message => permLevels.superusers?.includes(message.author?.id || message.user?.id)
        },
        {
            level: 9,
            name: "Bot Owner",
            verify: async message => {
                try {
                    const app = await message.client.application.fetch();
                    if (app.owner.id === (message.author?.id || message.user?.id)) return true;
                } catch (err) {
                    return false;
                }
            }
        }
    ]
};

module.exports = permLevels;