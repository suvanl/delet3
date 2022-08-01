import { EmbedBuilder, version } from "discord.js";
import { stripIndents } from "common-tags";
import { Duration } from "luxon";
import pkg from "../../../package.json";

const { version: ver } = pkg;

export const run = async (client, interaction) => {
    const app = await interaction.client.application.fetch();
    const ownerTag = `${app.owner.username}#${app.owner.discriminator}`;
    const uptimeStr = Duration.fromObject({ days: 0, hours: 0, minutes: 0, seconds: (client.uptime / 1000).toFixed() }).normalize().toHuman({ unitDisplay: "short" });

    const embed = new EmbedBuilder()
        .setColor("#56dcff")
        .setAuthor({ name: `delet ${ver}`, iconURL: client.user.displayAvatarURL() })
        .setDescription(stripIndents`
            👥 **Users**: ${client.users.cache.size} | 💬 **Servers**: ${client.guilds.cache.size} | 🕙 **Uptime**: ${uptimeStr}
            🧠 **Memory usage**: ~${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed()}MB | 🔑 **Owner**: ${ownerTag} | 🌐 **Translators**: [see list](https://github.com/suvanl/delet3/#translations)`)
        .setFooter({ text: `Discord.js ${version}`, iconURL: "https://i.imgur.com/RWcHLuz.png"})
        .setTimestamp();

    return interaction.reply({ embeds: [embed], ephemeral: true });
};

export const data = {
    name: "about",
    description: "Sends info about delet3",
    options: []
};

export const global = false;
