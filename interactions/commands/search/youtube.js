import fetch from "node-fetch";
import { ActionRowBuilder, ApplicationCommandOptionType, ButtonBuilder, ButtonStyle, ComponentType, SelectMenuBuilder } from "discord.js";
import { decode } from "html-entities";

const { YOUTUBE_KEY } = process.env;
const BASE_URL = "https://www.googleapis.com/youtube/v3/search";

export const run = async (client, interaction) => {
    const query = interaction.options.getString("query");
    const share = interaction.options.getBoolean("share") || false;

    // Fetch YouTube results for the specified query
    const url = `${BASE_URL}?part=snippet&q=${encodeURIComponent(query)}&maxResults=9&key=${YOUTUBE_KEY}`;
    const res = await fetch(url);
    const { items: data } = await res.json();

    // Filter out results that aren't videos (i.e. channels)
    const vids = data.filter(f => f.id.kind === "youtube#video");

    // Inform user if no results are returned:
    //  ℹ No results found
    if (!vids.length) return interaction.reply({ content: `ℹ ${client.l10n(message, "yt.noResults")}`, ephemeral: true });

    const options = [];
    vids.forEach((vid, index) => {
        // For each video found, create an object containing `label`, `description` and `value`, and push it to the options array
        options.push({
            label: decode(vid.snippet.title),
            description: `Description: ${decode(vid.snippet.description).truncate(50)}`,
            value: index.toString()
        });
    });
    
    // Create select menu with options
    const selectMenu = new SelectMenuBuilder()
        .setCustomId("select")
        .setPlaceholder("Select a video to view")
        .addOptions(options);

    // Create cancel button
    const btnCancel = new ButtonBuilder()
        .setCustomId("btnCancel")
        .setLabel("Cancel")
        .setStyle(ButtonStyle.Secondary);

    // Create ActionRows for components
    const row1 = new ActionRowBuilder().addComponents([selectMenu]);
    const row2 = new ActionRowBuilder().addComponents([btnCancel]);

    // Store the response in a variable, allowing us to access InteractionResponse (required for the collector to work properly)
    const response = await interaction.reply({
        content: `<:youtube:704116193421688862> **${client.l10n(interaction, "yt.search.results")}**`,
        components: [row1, row2],
        ephemeral: !share
    });

    // Define the filter function for the collector and create the collector
    const filter = i => ["select", "btnCancel"].includes(i.customId) && i.user.id === interaction.user.id;
    const collector = response.createMessageComponentCollector({ filter, time: 30000, idle: 30000, dispose: true });

    // Listen for the "collect" event
    collector.on("collect", async i => {
        if (i.componentType === ComponentType.SelectMenu) {
            collector.stop();

            // Find the selected video in the array of videos
            const vidId = vids[parseInt(i.values[0])].id.videoId;

            // Create youtu.be link
            const vidUrl = `https://youtu.be/${vidId}`;

            // Reply with the video URL
            return await i.update({ content: `🎥 ${client.l10n(interaction, "yt.vid")} ${vidUrl}`, components: [], ephemeral: !share });
        }

        if (i.componentType === ComponentType.Button && i.customId === "btnCancel") {
            collector.stop("User cancelled");
            return await i.update({ content: client.l10n(interaction, "yt.cancel"), components: [], ephemeral: !share });
        }
    });
};

export const data = {
    name: "youtube",
    description: "Search YouTube for a video",
    options: [{
        name: "query",
        type: ApplicationCommandOptionType.String,
        description: "Your search query",
        required: true
    },
    { 
        name: "share",
        type: ApplicationCommandOptionType.Boolean,
        description: "Whether to make the response publicly visible",
        required: false
    }]
};

export const global = true;
