const fetch = require("node-fetch");

exports.run = async (client, message, args) => {
    if (!args[0]) return message.channel.send("You must provide a new prefix.");
    const newPrefix = args[0];

    const secret = await client.genSecret();
    const url = `${process.env.URL}/guilds/${message.guild.id}`;
    const body = { "settings": { "prefix": newPrefix } };

    const meta = { "Content-Type": "application/json", "Authorization": `jwt ${secret.token}` };

    try {
        const res = await fetch(url, {
            method: "PUT",
            body: JSON.stringify(body),
            headers: meta
        });

        if (res.status === 200) return message.channel.send(`Prefix successfully changed to \`${newPrefix}\`.`);
    } catch (err) {
        message.channel.send("An error occurred whilst changing the prefix.");
        return client.logger.err(`Error changing prefix:\n${err.stack}`);
    }
};

exports.config = {
    aliases: [],
    enabled: true,
    guildOnly: true,
    permLevel: "Moderator"
};

exports.help = {
    name: "prefix",
    description: "Changes delet's prefix on the current server.",
    category: "Settings",
    usage: "prefix <prefix>"
};