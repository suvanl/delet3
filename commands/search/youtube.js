const fetch = require("node-fetch");
const Entities = require("html-entities").AllHtmlEntities;
const { stripIndents } = require("common-tags");
const { YOUTUBE_KEY } = process.env;

const e = new Entities();

exports.run = async (client, message, args) => {
    // Define query
    const q = args.join(" ");
    if (!q) return message.channel.send("ℹ You must provide a video name to search for.");

    // YouTube API base URL
    const baseUrl = "https://www.googleapis.com/youtube/v3/search";

    // Send GET request to API & parse res as json
    const url = `${baseUrl}?part=snippet&q=${encodeURIComponent(q)}&maxResults=9&key=${YOUTUBE_KEY}`;
    const res = await fetch(url);
    const json = await res.json();
    const data = json.items;

    // Filter out results that aren't videos (i.e. channels)
    const vids = data.filter(f => f.id.kind === "youtube#video");
    
    // Create a list of video titles
    let i = 0;
    const list = vids.map(v => `**${++i}** | ${e.decode(v.snippet.title)}`).join("\n");

    // Define prompt message
    const range = `1-${vids.length}`;
    const msg = stripIndents`
        <:youtube:704116193421688862> **YouTube search results**

        ${list}
        
        **Reply with a number (${range}) to select a video...**`;
    
    // Prompt for selected video
    const selected = await client.awaitReply(message, msg, 30000);

    // If 30s is up, or if user replies with "cancel"
    if (!selected || selected.toLowerCase() === "cancel") return message.channel.send("🚪 Ended the video selection procedure.");

    // Valid answers
    const num = Array.from({ length: vids.length }, (v, k) => k + 1);

    // Parse value as integer
    const selectedInt = parseInt(selected);

    // If user doesn't reply with value in range
    if (!num.includes(selectedInt)) return message.channel.send(client.l10n(message, "settings.invalidNum").replace(/%range%/g, range));
    else {
        // Else, if they have replied with a valid value...
        // Get video ID (array index = selected - 1, because array indexes start at 0)
        const vidId = vids[selectedInt - 1].id.videoId;

        // Create youtu.be URL using the video ID
        const vidUrl = `https://youtu.be/${vidId}`;

        // Send URL (along with some text to indicate user-requested content)
        return message.channel.send(`Here's the video you requested, ${message.author}:\n${vidUrl}`);
    }
};

exports.config = {
    aliases: ["yt"],
    enabled: true,
    guildOnly: false,
    permLevel: "User"
};

exports.help = {
    name: "youtube",
    description: "searches YouTube for the specified video",
    category: "search",
    usage: "youtube <query>"
};