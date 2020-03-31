module.exports = (client, member) => {
    const settings = client.getSettings(member.guild);

    if (settings.welcomeEnabled !== "true") return;

    // TODO: save new member to DB

    // TODO: test this (by setting welcomeEnabled to true in settings)
    const welcomeStr = settings.welcomeMessage;
    const mapObj = { "{{server}}": guild.name, "user": member.user.tag };

    const msg = welcomeStr.replace(/{{server}}|{{user}}/g, matched => {
        return mapObj[matched];
    });

    member.guild.channels.find(c => c.name === settings.welcomeChannel.send(msg).catch(console.error));
};