import fetch from "node-fetch";
import { DateTime } from "luxon";
import { stripIndents } from "common-tags";
import { MessageEmbed } from "discord.js";

const { OWM_KEY } = process.env;

export const run = async (client, message, args) => {
    // Define location
    let location = args.join(" ");

    // If no location is provided, return & inform user
    if (!location) return message.reply(stripIndents`
        ℹ️ ${client.l10n(message, "weather.noLocation")}
        📖 ${client.l10n(message, "weather.example").replace(/%cmd%/g, `${message.settings.prefix}weather`)}.`);

    // If location contains apostrophe, ensure it is a valid one
    if (location.includes("‘")) location = location.replace(/‘/g, "'");

    // Encode location as URI component
    const loc = encodeURIComponent(location);

    // Get two-letter language code for the "lang" parameter in the API request
    const lang = message.type !== "APPLICATION_COMMAND" ? message.settings.language.slice(0, 2) || "en" : message.locale.substring(0, 2);

    // Send GET request to OpenWeatherMap API for weather data
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${loc}&units=metric&lang=${lang}&appid=${OWM_KEY}`;
    const res = await fetch(url);
    const data = await res.json();

    // Inform user if 404 occurs
    if (data.cod === "404") return message.reply(stripIndents`
        ⚠️ **${client.l10n(message, "weather.404.error").replace(/%err%/g, `${data.cod} ${data.message}`)}**

        ➡️ ${client.l10n(message, "weather.404.valid")}
        ℹ️ ${client.l10n(message, "weather.404.help").replace(/%cmd%/g, `${message.settings.prefix}help weather`)}`);

    // Get appropriate weather icon
    const img = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;

    // Convert angle to compass direction (for wind)
    const degToCompass = num => {
        const val = Math.floor((num / 22.5) + 0.5);
        const arr = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
        return arr[(val % 16)];
    };

    let windDirection = data.wind.deg ? degToCompass(data.wind.deg) : "";

    // Localise compass directions
    const wdFriendly = {
        "N": client.l10n(message, "weather.n"),
        "NNE": client.l10n(message, "weather.nne"),
        "NE": client.l10n(message, "weather.ne"),
        "ENE": client.l10n(message, "weather.ene"),
        "E": client.l10n(message, "weather.e"),
        "ESE": client.l10n(message, "weather.ese"),
        "SE": client.l10n(message, "weather.se"),
        "SSE": client.l10n(message, "weather.sse"),
        "S": client.l10n(message, "weather.s"),
        "SSW": client.l10n(message, "weather.ssw"),
        "SW": client.l10n(message, "weather.sw"),
        "WSW": client.l10n(message, "weather.wsw"),
        "W": client.l10n(message, "weather.w"),
        "WNW": client.l10n(message, "weather.wnw"),
        "NW": client.l10n(message, "weather.nw"),
        "NNW": client.l10n(message, "weather.nnw")
    };

    // If wind direction data exists, convert to a user-friendly compass direction
    if (data.wind.deg) windDirection = wdFriendly[degToCompass(data.wind.deg)];

    // Predefine some of the data
    const flag = `:flag_${data.sys.country.toLowerCase()}:`;
    const updatedTime = DateTime.fromSeconds(data.dt + data.timezone).toUTC().toFormat("HH:mm");
    const temp = Math.round(data.main.temp);
    const wind = `${(Math.round(data.wind.speed) * 3.6).toFixed()}${client.l10n(message, "weather.kmh")} ${windDirection}`;
    const sunrise = DateTime.fromSeconds(data.sys.sunrise + data.timezone).toUTC().toFormat("HH:mm");
    const sunset = DateTime.fromSeconds(data.sys.sunset + data.timezone).toUTC().toFormat("HH:mm");

    // Construct & send embed
    const embed = new MessageEmbed()
        .setColor(tempColour(temp))
        .setThumbnail(img)
        .setDescription(stripIndents`
            ${flag} __**${client.l10n(message, "weather.title").replace(/%area%/g, `${data.name}, ${data.sys.country}`)}**__
            ${client.l10n(message, "weather.updatedAt").replace(/%time%/g, updatedTime)}

            🌆 ${client.l10n(message, "weather.conditions")}: **${data.weather[0].description}**

            🌡️ ${client.l10n(message, "weather.temp")}: **${temp}°C**
            ☂️ ${client.l10n(message, "weather.feels")}: **${Math.round(data.main.feels_like)}°C**
            💧 ${client.l10n(message, "weather.humidity")}: **${data.main.humidity}%**
            🍃 ${client.l10n(message, "weather.wind")}: **${wind}**

            🌅 ${client.l10n(message, "weather.sunrise")}: **${sunrise}**
            🌇 ${client.l10n(message, "weather.sunset")}: **${sunset}**`)
        .setFooter({ text: client.l10n(message, "weather.footer"), iconURL: "https://i.imgur.com/OodcJh8.jpg" });
    
    message.reply({ embeds: [embed] });
};

// Sets embed colour based on temperature value
// Ranges are partially based on those on the BBC Weather website (https://bbc.co.uk/weather)
// Gradients used: 
// - https://www.colorhexa.com/adfdcd-to-fc6272 (Reverse HSV)
// - https://www.colorhexa.com/62bffc-to-adfdcd (RGB)
const tempColour = x => {
    let colour;
    switch (true) {
        case x < -15:
            colour = "#6ec9f4";
            break;

        case x < -10:
            colour = "#7bd4ec";
            break;

        case x < -5:
            colour = "#87dee4";
            break;

        case x < -2:
            colour = "#94e8dd";
            break;

        case x < 0:
            colour = "#a1f3d5";
            break;

        case x < 4:
            colour = "#adfdcd";
            break;

        case x < 8:
            colour = "#a7fdb7";
            break;

        case x < 10:
            colour = "#a2fda0";
            break;

        case x < 12:
            colour = "#b0fd9a";
            break;

        case x < 14:
            colour = "#c1fd94";
            break;

        case x < 16:
            colour = "#d5fd8e";
            break;

        case x < 18:
            colour = "#ebfd87";
            break;

        case x < 20:
            colour = "#fcf581";
            break;

        case x < 24:
            colour = "#fcd97b";
            break;

        case x < 29:
            colour = "#fcbb75";
            break;

        case x < 35:
            colour = "#fc9b6e";
            break;

        case x < 40:
            colour = "#fc7868";
            break;

        case x >= 40:
            colour = "#fc6272";
            break;

        default:
            colour = "#62bffc";
    }
    
    return colour;
};

export const config = {
    aliases: [],
    enabled: true,
    guildOnly: false,
    permLevel: "User"
};

export const help = {
    name: "weather",
    description: "sends weather info for the specified area",
    category: "info",
    usage: "weather <city>[, country]"
};