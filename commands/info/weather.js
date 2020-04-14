const fetch = require("node-fetch");
const moment = require("moment");
const { stripIndents } = require("common-tags");
const { MessageEmbed } = require("discord.js");
const { OWM_KEY } = process.env;

exports.run = async (client, message, args) => {
    // Define location
    const location = args.join(" ");

    // If no location is provided, return & inform user
    if (!location) return message.channel.send(stripIndents`
        ℹ️ ${client.l10n(message, "weather.noLocation")}
        📖 ${client.l10n(message, "weather.example").replace(/%cmd%/g, `${message.settings.prefix}weather`)}.`);

    // Encode location as URI component
    const loc = encodeURIComponent(location);

    // Send GET request to OpenWeatherMap API for weather data
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${loc}&units=metric&appid=${OWM_KEY}`;
    const res = await fetch(url);
    const data = await res.json();

    // Inform user if 404 occurs
    if (data.cod === "404") return message.channel.send(stripIndents`
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
    const updatedTime = moment.utc(moment.unix(data.dt + data.timezone)).format("HH:mm");
    const wind = `${(Math.round(data.wind.speed) * 3.6).toFixed()}${client.l10n(message, "weather.kmh")} ${windDirection}`;
    const sunrise = moment.utc(moment.unix(data.sys.sunrise + data.timezone)).format("HH:mm");
    const sunset = moment.utc(moment.unix(data.sys.sunset + data.timezone)).format("HH:mm");

    // Construct & send embed
    const embed = new MessageEmbed()
        .setColor("#62bffc")
        .setThumbnail(img)
        .setDescription(stripIndents`
            ${flag} __**${client.l10n(message, "weather.title").replace(/%area%/g, `${data.name}, ${data.sys.country}`)}**__
            ${client.l10n(message, "weather.updatedAt").replace(/%time%/g, updatedTime)}

            🌆 ${client.l10n(message, "weather.conditions")}: **${data.weather[0].description}**

            🌡️ ${client.l10n(message, "weather.temp")}: **${Math.round(data.main.temp)}°C**
            ☂️ ${client.l10n(message, "weather.feels")}: **${Math.round(data.main.feels_like)}°C**
            💧 ${client.l10n(message, "weather.humidity")}: **${data.main.humidity}%**
            🍃 ${client.l10n(message, "weather.wind")}: **${wind}**

            🌅 ${client.l10n(message, "weather.sunrise")}: **${sunrise}**
            🌇 ${client.l10n(message, "weather.sunset")}: **${sunset}**`)
        .setFooter(client.l10n(message, "weather.footer"), "https://i.imgur.com/OodcJh8.jpg");
    
    message.channel.send(embed);
};

exports.config = {
    aliases: [],
    enabled: true,
    guildOnly: false,
    permLevel: "User"
};

exports.help = {
    name: "weather",
    description: "sends weather info for the specified area",
    category: "info",
    usage: "weather <city>[, country]"
};