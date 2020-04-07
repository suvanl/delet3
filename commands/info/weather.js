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
        ℹ️ Please provide a location to look up weather info for.
        📖 E.g. \`${message.settings.prefix}weather London\`.`);

    // Encode location as URI component
    const loc = encodeURIComponent(location);

    // Send GET request to OpenWeatherMap API for weather data
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${loc}&units=metric&appid=${OWM_KEY}`;
    const res = await fetch(url);
    const data = await res.json();

    // Inform user if 404 occurs
    if (data.cod === "404") return message.channel.send(stripIndents`
        ⚠️ An error occurred: \`${data.cod} ${data.message}\`.
        ➡️ Please ensure you've provided a valid city name. Try specifying the country name as well.`);

    // Get appropriate weather icon
    const img = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;

    // Convert angle to compass direction (for wind)
    const degToCompass = num => {
        const val = Math.floor((num / 22.5) + 0.5);
        const arr = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
        return arr[(val % 16)];
    };

    // Construct & send embed
    const embed = new MessageEmbed()
        .setColor("#62bffc")
        .setThumbnail(img)
        .setDescription(stripIndents`
            :flag_${data.sys.country.toLowerCase()}: __**Weather Info for ${data.name}, ${data.sys.country}**__
            Last updated at ${moment.utc(moment.unix(data.dt + data.timezone)).format("HH:mm")} local time

            🌆 Conditions: **${data.weather[0].description}**

            🌡️ Temperature: **${Math.round(data.main.temp)}°C**
            ☂️ Feels like: **${Math.round(data.main.feels_like)}°C**
            💧 Humidity: **${data.main.humidity}%**
            🍃 Wind: **${(Math.round(data.wind.speed) * 3.6).toFixed()}km/h ${data.wind.deg ? degToCompass(data.wind.deg) : ""}**

            🌅 Sunrise: **${moment.utc(moment.unix(data.sys.sunrise + data.timezone)).format("HH:mm")}**
            🌇 Sunset: **${moment.utc(moment.unix(data.sys.sunset + data.timezone)).format("HH:mm")}**`)
        .setFooter("Data provided by OpenWeatherMap | all times are local", "https://i.imgur.com/OodcJh8.jpg");
    
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