import fetch from "node-fetch";
import { decode } from "html-entities";
import { stripIndents } from "common-tags";

const { YOUTUBE_KEY } = process.env;

export const run = async (client, message, args) => {
    client.sendDeprecationWarning(message, "Use the `/youtube` slash command instead.");

    // Define query
    const query = args.join(" ");
    if (!query) return message.reply(`ℹ ${client.l10n(message, "yt.noQuery")}`);

    // YouTube API base URL
    const baseUrl = "https://www.googleapis.com/youtube/v3/search";

    // Send GET request to API & parse res as json
    const url = `${baseUrl}?part=snippet&q=${encodeURIComponent(query)}&maxResults=9&key=${YOUTUBE_KEY}`;
    const res = await fetch(url);
    const json = await res.json();
    const data = json.items;

    // Filter out results that aren't videos (i.e. channels)
    const vids = data.filter(f => f.id.kind === "youtube#video");

    // Inform user if no results are returned:
    //  ℹ No results found
    if (!vids.length) return message.reply(`ℹ ${client.l10n(message, "yt.noResults")}`);
    
    // Create a list of video titles
    let i = 0;
    const list = vids.map(v => `**${++i}** | ${decode(v.snippet.title)}`).join("\n");

    // Define prompt message
    const range = `1-${vids.length}`;
    const msg = stripIndents`
        <:youtube:704116193421688862> **${client.l10n(message, "yt.search.results")}**

        ${list}
        
        **${client.l10n(message, "yt.search.number").replace(/%range%/g, range)}**`;
    
    // Prompt for selected video
    const selected = await client.awaitReply(message, msg, 30000);

    // If 30s is up, or if user replies with "cancel"
    if (!selected || selected.toLowerCase() === "cancel") return message.reply(`🚪 ${client.l10n(message, "yt.cancel")}`);

    // Valid answers
    const num = Array.from({ length: vids.length }, (v, k) => k + 1);

    // Parse value as integer
    const selectedInt = parseInt(selected);

    // If user doesn't reply with value in range
    if (!num.includes(selectedInt)) return message.reply(client.l10n(message, "settings.invalidNum").replace(/%range%/g, range));
    else {
        // Else, if they have replied with a valid value...
        // Get video ID (array index = selected - 1, because array indexes start at 0)
        const vidId = vids[selectedInt - 1].id.videoId;

        // Create youtu.be URL using the video ID
        const vidUrl = `https://youtu.be/${vidId}`;

        // Send URL (along with some text to indicate that the link being sent is user-requested content)
        return message.reply(`🎥 ${client.l10n(message, "yt.vid")}\n${vidUrl}`);
    }
};

export const config = {
    aliases: ["yt"],
    enabled: true,
    guildOnly: false,
    permLevel: "User"
};

export const help = {
    name: "youtube",
    description: "searches YouTube for the specified search query",
    category: "search",
    usage: "youtube <query>"
};