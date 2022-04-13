import { MessageEmbed, version } from "discord.js";
import { stripIndents } from "common-tags";
import { Duration } from "luxon";
import pkg from "../../package.json";

const { version: ver } = pkg;

export const run = async (client, message) => {
    const app = await message.client.application.fetch();
    const ownerTag = `${app.owner.username}#${app.owner.discriminator}`;
    const uptime = Duration.fromMillis(client.uptime);
    const uptimeStr = `${uptime.toFormat("d")} days, ${uptime.toFormat("hh:mm:ss")}`;

    const embed = new MessageEmbed()
        .setColor("#56dcff")
        .setAuthor({ name: `delet ${ver} - About`, iconURL: client.user.displayAvatarURL() })
        .setDescription(stripIndents`
            👥 **Users**: ${client.users.cache.size} | 💬 **Servers**: ${client.guilds.cache.size} | 🕙 **Uptime**: ${uptimeStr}
            🧠 **Memory usage**: ~${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed()}MB | 🔑 **Owner**: ${ownerTag} | 🌐 **Translators**: [see list](https://github.com/suvanl/delet3/#translations)`)
        .setFooter({ text: `Made with Discord.js ${version}`, iconURL: "https://i.imgur.com/RWcHLuz.png"})
        .setTimestamp();

    return message.reply({ embeds: [embed], ephemeral: true });
};

export const config = {
    aliases: ["info"],
    enabled: true,
    guildOnly: false,
    permLevel: "User"
};

export const help = {
    name: "about",
    description: "sends info about myself",
    category: "info",
    usage: "about"
};