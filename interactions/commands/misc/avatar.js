import { ApplicationCommandOptionType, EmbedBuilder } from "discord.js";
import { stripIndents } from "common-tags";

export const run = async (client, interaction) => {
    const user = interaction.options.getUser("user");
    const isServerSpecific = interaction.options.getBoolean("server");

    const guildMember = interaction.guild.members.cache.get(user.id);
    const size = 1024;
    const url = isServerSpecific ? guildMember.displayAvatarURL({ size }) : user.displayAvatarURL({ size });

    // Create and send embed
    const embed = new EmbedBuilder()
        .setColor("#99AAB5")
        .setDescription(stripIndents`
            🖼️ **${client.l10n(interaction, "avatar.user").replace(/%user%/g, user.tag)}**
            🔗 **[${client.l10n(interaction, "avatar.url")}](${url})**`)
        .setImage(url);
    
    interaction.reply({ embeds: [embed], ephemeral: true });
};

export const data = {
    name: "avatar",
    description: "View a user's avatar in high resolution",
    options: [{ 
        name: "user",
        type: ApplicationCommandOptionType.User,
        description: "The user whose avatar you'd like to view",
        required: true
    },
    { 
        name: "server",
        type: ApplicationCommandOptionType.Boolean,
        description: "Whether you'd like to see the server-specific avatar of a Nitro user",
        required: false
    }]
};

export const global = true;
