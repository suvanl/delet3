const { MessageEmbed, version } = require("discord.js");
const { stripIndents } = require("common-tags");
const m = require("moment");

const deletVersion = require("../../package.json").version;

exports.run = async (client, message) => {
    const owner = await client.users.fetch(process.env.OWNER_ID);
    const ownerTag = `${owner.username}#${owner.discriminator}`;

    const embed = new MessageEmbed()
        .setColor("#56dcff")
        .setAuthor(`delet ${deletVersion} - About`, client.user.displayAvatarURL())
        .setDescription(stripIndents`
            👥 **Users**: ${client.users.cache.size} | 💬 **Servers**: ${client.guilds.cache.size} | 🕙 **Uptime**: ${m.utc(client.uptime).format("HH:mm:ss")}
            🧠 **Memory usage**: ~${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed()}MB | 🔑 **Owner**: ${ownerTag}
            `)
        .setFooter(`Made with Discord.js ${version}`, "https://i.imgur.com/RWcHLuz.png")
        .setTimestamp();

    message.channel.send(embed);
};

exports.config = {
    aliases: ["info"],
    enabled: true,
    guildOnly: false,
    permLevel: "User"
};

exports.help = {
    name: "about",
    description: "sends info about myself",
    category: "info",
    usage: "about"
};