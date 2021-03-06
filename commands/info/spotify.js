const fetch = require("node-fetch");
const moment = require("moment");
const { MessageEmbed } = require("discord.js");
const { stripIndents } = require("common-tags");
const { keys } = require("../../core/util/data");
const { SPOTIFY_ID: ID, SPOTIFY_SECRET: SECRET } = process.env;

exports.run = async (client, message, args) => {
    // Define "not listening" message:
        // ℹ Not listening to a song
        // Please ensure you're listening to a song (on a Spotify account that's connected to Discord)
    const notListening = stripIndents`
        ℹ **${client.l10n(message, "spotify.notListening")}**
        ${client.l10n(message, "spotify.notListening.info")}`;

    // Message author's current activities
    const activities = message.author.presence.activities;
    if (!activities.length) return message.channel.send(notListening);

    // Get "Listening to Spotify" activity
    const spotifyActivity = activities.filter(a => a.name === "Spotify" && a.type === "LISTENING");
    if (!spotifyActivity.length) return message.channel.send(notListening);

    // Define Spotify track ID
    const id = spotifyActivity[0].syncID;

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

    const trackTitle = client.l10n(message, "spotify.trackTitle")
        .replace(/%song%/g, `**${tData.name}**`)
        .replace(/%artists%/g, `**${artists}**`);
    
    const albumArt = tData.album.images[0].url;
    const emoji = "<:spotify:704771723232542900>";

    // If user only requests album art
    const artArgs = ["art", "cover"];

    if (args[0] && artArgs.includes(args[0])) {
        const embed = new MessageEmbed()
            .setColor("#2bde6a")
            .setImage(albumArt)
            .setDescription(`${emoji} ${trackTitle}`);

        return message.channel.send(embed);
    }

    // Send GET request to Spotify API for audio features (AF)
    const afUrl = `https://api.spotify.com/v1/audio-features/${id}`;
    const afInfo = await fetch(afUrl, {
        method: "get",
        headers: meta
    });

    // Parse audio features data as JSON
    const afData = await afInfo.json();

    // Predefined data for embed
    const releaseDate = moment(tData.album.release_date, "YYYY-MM-DD").format("DD/MM/YYYY");
    
    let key = keys[afData.key];
    if (afData.mode === 0 && key.includes("/")) key = `${key.substring(0, key.length - 3)}m`;

    // First row
    const keyTxt = client.l10n(message, "spotify.key");
    const timeSignature = client.l10n(message, "spotify.timeSignature");
    const tempo = client.l10n(message, "spotify.tempo");
    const tempoValue = client.l10n(message, "spotify.tempo.value").replace(/%num%/g, Math.round(afData.tempo));

    // Second row
    const danceability = client.l10n(message, "spotify.danceability");
    const energy = client.l10n(message, "spotify.energy");
    const acousticness = client.l10n(message, "spotify.acousticness");

    // Create and send embed
    const embed = new MessageEmbed()
        .setColor("#2bde6a")
        .setThumbnail(albumArt)
        .setDescription(stripIndents`
            ${emoji} ${trackTitle}
            [${client.l10n(message, "spotify.play")}](${tData.external_urls.spotify})

            🎼 ${keyTxt}: **${key}** • ${timeSignature}: **${afData.time_signature}/4** • ${tempo}: ${tempoValue}
            🔢 ${danceability}: **${Math.round(afData.danceability * 10)}/10** • ${energy}: **${Math.round(afData.energy * 10)}/10** • ${acousticness}: **${Math.round(afData.acousticness * 10)}/10**`)
        .setFooter(`${tData.album.name} • ${client.l10n(message, "spotify.releaseDate").replace(/%date%/g, releaseDate)}`);

    return message.channel.send(embed);
};

auth = async () => {
    // Function to encode string as base64
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

exports.config = {
    aliases: [],
    enabled: true,
    guildOnly: false,
    permLevel: "User"
};

exports.help = {
    name: "spotify",
    description: "sends info about the track you're currently listening to on Spotify",
    category: "info",
    usage: "spotify [cover]"
};