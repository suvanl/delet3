const fetch = require("node-fetch");

module.exports = async (client, member) => {
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

    // Welcome message stuff
    const settings = client.getSettings(member.guild);
    if (settings.welcomeEnabled !== "true") return;

    // TODO: test this (by setting welcomeEnabled to true in settings)
    const welcomeStr = settings.welcomeMessage;
    const mapObj = { "{{server}}": guild.name, "user": member.user.tag };

    const msg = welcomeStr.replace(/{{server}}|{{user}}/g, matched => {
        return mapObj[matched];
    });

    member.guild.channels.find(c => c.name === settings.welcomeChannel.send(msg).catch(console.error));
};