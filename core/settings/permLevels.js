const permLevels = {
    "superusers": [],
    
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
                    const modRole = message.guild.roles.find(r => r.name.toLowerCase() === message.settings.modRole.toLowerCase());
                    if (modRole && message.member.roles.has(modRole.id)) return true;
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
                    const adminRole = message.guild.roles.find(r => r.name.toLowerCase() === message.settings.adminRole.toLowerCase());
                    if (adminRole && message.member.roles.has(adminRole.id)) return true;
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
                    if (message.channel.type === "text")
                        if (message.guild.ownerID === message.author.id) return true;
                } catch (err) {
                    return false;
                }
            }
        },
        {
            level: 6,
            name: "Superuser",
            verify: message => {
                permLevels.superusers.includes(message.author.id);
            }
        },
        {
            level: 9,
            name: "Bot Owner",
            verify: message => {
                try {
                    if (process.env.OWNER_ID === message.author.id) return true;
                } catch (err) {
                    return false;
                }
            }
        }
    ]
};

module.exports = permLevels;