const fetch = require("node-fetch");
const { stripIndents } = require("common-tags");

exports.run = async (client, message, args) => {
    // let newPrefix = args[0] || the await reply input

    const msg = stripIndents`
        ⚙️ The current prefix is \`${message.settings.prefix}\`.
        🔄 Please enter the new prefix. Reply with \`cancel\` to exit.`;

    const newPrefix = args[0] || await client.awaitReply(message, msg);
    if (newPrefix.toLowerCase() === "cancel") return message.channel.send(stripIndents`
        🚪 Ended the settings customisation procedure.
    `);

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

        if (res.status === 200) return message.channel.send(`<:tick:688400118549970984> Prefix successfully changed to \`${newPrefix}\`.`);
    } catch (err) {
        message.channel.send("<:x_:688400118327672843> An error occurred whilst changing the prefix.");
        return client.logger.err(`Error changing prefix:\n${err.stack}`);
    }
};

exports.config = {
    aliases: [],
    enabled: true,
    guildOnly: true,
    permLevel: "Server Moderator"
};

exports.help = {
    name: "prefix",
    description: "changes delet's prefix on the current server.",
    category: "settings",
    usage: "prefix [prefix]"
};