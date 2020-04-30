const fetch = require("node-fetch");
const moment = require("moment");
const { MessageEmbed } = require("discord.js");
const { stripIndents } = require("common-tags");
const { keys } = require("../../core/util/data");
const { SPOTIFY_ID: ID, SPOTIFY_SECRET: SECRET } = process.env;

exports.run = async (client, message) => {
    // Define "not listening to a song" message
    const notListening = stripIndents`
        ℹ **Not listening to a song**
        Please ensure you're listening to a song (on a Spotify account that's connected to Discord).`;

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

    // Send GET request to Spotify API for audio features (AF)
    const afUrl = `https://api.spotify.com/v1/audio-features/${id}`;
    const afInfo = await fetch(afUrl, {
        method: "get",
        headers: meta
    });

    // Parse audio features data as JSON
    const afData = await afInfo.json();

    // Predefined data for embed
    const emoji = "<:spotify:704771723232542900>";
    const artists = tData.artists.map(a => a.name).join(", ");
    const releaseDate = moment(tData.album.release_date, "YYYY-MM-DD").format("DD/MM/YYYY");
    
    let key = keys[afData.key];
    if (afData.mode === 0 && key.includes("/")) key = `${key.substring(0, key.length - 3)}m`;

    // Create and send embed
    const embed = new MessageEmbed()
        .setColor("#2bde6a")
        .setThumbnail(tData.album.images[0].url)
        .setDescription(stripIndents`
            ${emoji} **${tData.name}** by **${artists}**
            [Play on Spotify](${tData.external_urls.spotify})

            🎼 Key: **${key}** • Time signature: **${afData.time_signature}/4** • Tempo: **${Math.round(afData.tempo)}** BPM
            🔢 Danceability: **${Math.round(afData.danceability * 10)}/10** • Energy: **${Math.round(afData.energy * 10)}/10** • Acousticness: **${Math.round(afData.acousticness * 10)}/10**`)
        .setFooter(`${tData.album.name} • Released on ${releaseDate}`);

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
    usage: "spotify"
};