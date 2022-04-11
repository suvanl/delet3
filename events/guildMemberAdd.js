import fetch from "node-fetch";

export default async (client, member) => {
    // Save new guildMember to DB
    const secret = await client.genSecret();

    const url = `${process.env.URL}/users`;
    const body = { "userID": member.user.id, "guildID": member.guild.id };
    const meta = { "Content-Type": "application/json", "Authorization": `jwt ${secret.token}` };

    try {
        await fetch(url, {
            method: "post",
            body: JSON.stringify(body),
            headers: meta
        });
    } catch (err) {
        return client.logger.err(`Error saving new guildMember:\n${err.stack}`);
    }

    // Get guild settings
    const settings = await client.getSettings(member.guild);

    // If autoRoleEnabled is set to true...
    if (settings.autoRoleEnabled === true) {
        // Find the required role by name; if it isn't found, return
        const role = member.guild.roles.cache.find(r => r.name === settings.autoRoleName);
        if (!role) return;

        // Add the role (by ID) to the guildMember
        member.roles.add(role.id);
    }

    // If welcomeEnabled is set to true...
    if (settings.welcomeEnabled === true) {
        // Replace placeholders with actual data
        const welcomeStr = settings.welcomeMessage;
        const mapObj = { "{{server}}": member.guild.name, "{{user}}": member.user.tag };

        const msg = welcomeStr.replace(/{{server}}|{{user}}/g, matched => {
            return mapObj[matched];
        });

        // Find welcomeChannel and send welcomeMessage to it
        member.guild.channels.cache.find(c => c.name === settings.welcomeChannel).send(msg);
    }
};