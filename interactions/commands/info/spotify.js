import fetch from "node-fetch";
import { DateTime } from "luxon";
import { ActivityType, ApplicationCommandOptionType, EmbedBuilder } from "discord.js";
import { stripIndents } from "common-tags";
import { keys } from "../../../core/util/data";

const { SPOTIFY_ID: ID, SPOTIFY_SECRET: SECRET } = process.env;

const auth = async () => {
    // Encodes a string as base64
    const base64 = str => Buffer.from(str).toString("base64");

    // Parameters for request to Spotify API for access token
    const url = "https://accounts.spotify.com/api/token";
    const body = "grant_type=client_credentials";
    const meta = { "Authorization": `Basic ${base64(`${ID}:${SECRET}`)}`, "Content-Type": "application/x-www-form-urlencoded" };

    // Send POST request
    const res = await fetch(url, {
        method: "post",
        body: body,
        headers: meta
    });

    // Parse res data as JSON + return access token
    const data = await res.json();
    return data.access_token;
};

export const run = async (client, interaction) => {
    const cover = interaction.options.getBoolean("cover");
    const args = cover ? cover.toString().split(" ") : [];

    // Define "not listening" message:
        // ℹ Not listening to a song
        // Please ensure you're listening to a song (on a Spotify account that's connected to Discord)
    const notListening = stripIndents`
        ℹ **${client.l10n(interaction, "spotify.notListening")}**
        ${client.l10n(interaction, "spotify.notListening.info")}`;

    // Get author's current activities
    const member = interaction.member;

    const activities = member.guild.presences.cache.get(interaction.user.id).activities;
    if (!activities.length) return interaction.reply({ content: notListening, ephemeral: true });

    // Get "Listening to Spotify" activity
    const spotifyActivity = activities.filter(a => a.name === "Spotify" && a.type === ActivityType.Listening);
    if (!spotifyActivity.length) return interaction.reply({ content: notListening, ephemeral: true });

    // Define Spotify track ID
    const id = spotifyActivity[0].syncId;

    // Send GET request to Spotify API for track info
    const trackUrl = `https://api.spotify.com/v1/tracks/${id}?market=GB`;
    const token = await auth();
    const meta = { "Authorization": `Bearer ${token}` };
    const trackInfo = await fetch(trackUrl, {
        method: "get",
        headers: meta
    });

    // Parse trackInfo data as JSON
    const tData = await trackInfo.json();

    // Repeated track & embed data
    const artists = tData.artists.map(a => a.name).join(", ");

    const trackTitle = client.l10n(interaction, "spotify.trackTitle")
        .replace(/%song%/g, `**${tData.name}**`)
        .replace(/%artists%/g, `**${artists}**`);
    
    const albumArt = tData.album.images[0].url;
    const emoji = "<:spotify:704771723232542900>";

    // If user only requests album art
    const artArgs = ["art", "cover", "true"];

    if (args[0] && artArgs.includes(args[0])) {
        const embed = new EmbedBuilder()
            .setColor("#2bde6a")
            .setImage(albumArt)
            .setDescription(`${emoji} ${trackTitle}`);

        return interaction.reply({ embeds: [embed] });
    }

    // Send GET request to Spotify API for audio features (AF)
    const afUrl = `https://api.spotify.com/v1/audio-features/${id}`;
    const afInfo = await fetch(afUrl, {
        method: "get",
        headers: meta
    });

    // Parse audio features data as JSON
    const afData = await afInfo.json();

    // Predefine data for embed:
    // Release date
    const releaseDate = DateTime.fromISO(tData.album.release_date).toFormat("dd/MM/y");
    
    // Key
    let key = keys[afData.key];
    if (afData.mode === 0) {
        if (key.includes("/")) key = `${key.substring(0, key.length - 3)}m`;
        else key += "m";
    }

    // First row
    const keyTxt = client.l10n(interaction, "spotify.key");
    const timeSignature = client.l10n(interaction, "spotify.timeSignature");
    const tempo = client.l10n(interaction, "spotify.tempo");
    const tempoValue = client.l10n(interaction, "spotify.tempo.value").replace(/%num%/g, Math.round(afData.tempo));

    // Second row
    const danceability = client.l10n(interaction, "spotify.danceability");
    const energy = client.l10n(interaction, "spotify.energy");
    const acousticness = client.l10n(interaction, "spotify.acousticness");

    // Create and send embed
    const embed = new EmbedBuilder()
        .setColor("#2bde6a")
        .setThumbnail(albumArt)
        .setDescription(stripIndents`
            ${emoji} ${trackTitle}
            [${client.l10n(interaction, "spotify.play")}](${tData.external_urls.spotify})

            🎼 ${keyTxt}: **${key}** • ${timeSignature}: **${afData.time_signature}/4** • ${tempo}: ${tempoValue}
            🔢 ${danceability}: **${Math.round(afData.danceability * 10)}/10** • ${energy}: **${Math.round(afData.energy * 10)}/10** • ${acousticness}: **${Math.round(afData.acousticness * 10)}/10**`)
        .setFooter({ text: `${tData.album.name} • ${client.l10n(interaction, "spotify.releaseDate").replace(/%date%/g, releaseDate)}` });

    return interaction.reply({ embeds: [embed] });
};

export const data = {
    name: "spotify",
    description: "Sends info about the track you're currently listening to on Spotify",
    options: [{ 
        name: "cover",
        type: ApplicationCommandOptionType.Boolean,
        description: "Whether you'd like to see only the track's cover art (without any other info)",
        required: false
    }]
};

export const global = true;
