const fetch = require("node-fetch");
const moment = require("moment");
const { createCanvas, loadImage, registerFont } = require("canvas");
const { MessageAttachment } = require("discord.js");
const { stripIndents } = require("common-tags");
const { sep } = require("path");
const { OWM_KEY } = process.env;

exports.run = async (client, message, args) => {
    // Define location
    let location = args.join(" ");

    // If no location is provided, return & inform user
    if (!location) return message.channel.send(stripIndents`
        ℹ️ ${client.l10n(message, "forecast.noLocation")}
        📖 ${client.l10n(message, "forecast.example").replace(/%cmd%/g, `${message.settings.prefix}forecast`)}.`);

    // If location contains apostrophe, ensure it is a valid one
    if (location.includes("‘")) location = location.replace(/‘/g, "'");

    // Encode location as URI component
    const loc = encodeURIComponent(location);

    // Get two-letter language code for the "lang" parameter in the API request
    const lang = message.settings.language.slice(0, 2) || "en";

    // Function to obtain current weather data (to get lat/lon values)
    const getCurrent = async () => {
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${loc}&units=metric&lang=${lang}&appid=${OWM_KEY}`;
        const res = await fetch(url);
        return await res.json();
    };

    // Get lat/lon and location values from current weather data
    const current = await getCurrent();

    // Inform user if 404 occurs
    if (current.cod === "404") return message.channel.send(stripIndents`
        ⚠️ **${client.l10n(message, "weather.404.error").replace(/%err%/g, `${current.cod} ${current.message}`)}**

        ➡️ ${client.l10n(message, "weather.404.valid")}
        ℹ️ ${client.l10n(message, "weather.404.help").replace(/%cmd%/g, `${message.settings.prefix}help forecast`)}`);

    const { lat, lon } = current.coord;
    const { country } = current.sys;
    const { name } = current;

    // Send GET request to OWM One Call API for forecast data
    const url = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&units=metric&exclude=minutely&lang=${lang}&appid=${OWM_KEY}`;
    const res = await fetch(url);
    const data = await res.json();

    // IMAGE GENERATION

    // Create canvas
    const canvas = createCanvas(988, 627);
    const ctx = canvas.getContext("2d");

    // Locate assets directory
    const assetsDir = `${process.cwd()}${sep}assets`;

    // Define icon base URL
    const iconURL = "https://openweathermap.org/img/wn";

    // Set background image
    const background = await loadImage(`${assetsDir}${sep}forecast${sep}forecast-day.png`);
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

    // Register Inter font variants
    registerFont(`${assetsDir}${sep}fonts${sep}Inter-Regular-slnt=0.ttf`, { family: "Inter" });
    registerFont(`${assetsDir}${sep}fonts${sep}Inter-Bold-slnt=0.ttf`, { family: "Inter Bold" });

    // Heading
    ctx.font = "40px Inter Bold";
    ctx.fillStyle = "#ffffff";
    ctx.fillText(`${name}, ${country}`, 73, 102);

    // Current day and conditions
    ctx.font = "30px Inter Bold";
    ctx.fillText(`${moment.utc(moment.unix(data.current.dt + data.timezone_offset)).format("dddd")}, ${data.current.weather[0].description}`, 73, 200);

    // Icon
    const currentIcon = await loadImage(`${iconURL}/${data.current.weather[0].icon}@2x.png`);
    ctx.drawImage(currentIcon, 47, 202, 100, 100);

    // Current max temp
    ctx.font = "60px Inter Bold";
    ctx.fillText(`${("0" + Math.round(data.daily[0].temp.max)).slice(-2)}`, 150, 275); // alt 160

    // degrees C
    ctx.font = "30px Inter";
    ctx.fillStyle = "#d9e7f1";
    ctx.fillText("°C", 229, 253); // alt 239

    // Current min temp
    ctx.font = "60px Inter Bold";
    ctx.fillText(`${("0" + Math.round(data.daily[0].temp.min)).slice(-2)}`, 311, 275);

    // degrees C
    ctx.font = "30px Inter";
    ctx.fillStyle = "#d9e7f1";
    ctx.fillText("°C", 390, 253);

    // H o u r l y   f o r e c a s t

    ctx.font = "16px Inter Bold";
    ctx.fillStyle = "#ffffff";

    // Hours
    ctx.fillText(moment.utc(moment.unix(data.hourly[1].dt + data.timezone_offset)).format("HH:mm"), 528, 228);
    ctx.fillText(moment.utc(moment.unix(data.hourly[2].dt + data.timezone_offset)).format("HH:mm"), 598, 228);
    ctx.fillText(moment.utc(moment.unix(data.hourly[3].dt + data.timezone_offset)).format("HH:mm"), 668, 228);
    ctx.fillText(moment.utc(moment.unix(data.hourly[4].dt + data.timezone_offset)).format("HH:mm"), 738, 228);
    ctx.fillText(moment.utc(moment.unix(data.hourly[5].dt + data.timezone_offset)).format("HH:mm"), 808, 228);

    // Hourly icons
    const hour1 = await loadImage(`${iconURL}/${data.hourly[1].weather[0].icon}.png`);
    const hour2 = await loadImage(`${iconURL}/${data.hourly[2].weather[0].icon}.png`);
    const hour3 = await loadImage(`${iconURL}/${data.hourly[3].weather[0].icon}.png`);
    const hour4 = await loadImage(`${iconURL}/${data.hourly[4].weather[0].icon}.png`);
    const hour5 = await loadImage(`${iconURL}/${data.hourly[5].weather[0].icon}.png`);

    // Position icons
    ctx.drawImage(hour1, 526.5, 221, 50, 50);
    ctx.drawImage(hour2, 596.5, 221, 50, 50);
    ctx.drawImage(hour3, 666.5, 221, 50, 50);
    ctx.drawImage(hour4, 736.5, 221, 50, 50);
    ctx.drawImage(hour5, 806.5, 221, 50, 50);

    // Hourly temperatures
    ctx.font = "16px Inter";
    
    ctx.fillText(`${Math.round(data.hourly[1].temp)}°`, 539, 276);
    ctx.fillText(`${Math.round(data.hourly[2].temp)}°`, 609, 276);
    ctx.fillText(`${Math.round(data.hourly[3].temp)}°`, 679, 276);
    ctx.fillText(`${Math.round(data.hourly[4].temp)}°`, 749, 276);
    ctx.fillText(`${Math.round(data.hourly[5].temp)}°`, 819, 276);

    // D a i l y    f o r e c a s t

    // Day names
    ctx.font = "30px Inter Bold";
    ctx.fillText(moment.utc(moment.unix(data.daily[0].dt + data.timezone_offset)).format("ddd"), 73, 370);
    ctx.fillText(moment.utc(moment.unix(data.daily[1].dt + data.timezone_offset)).format("ddd"), 203, 370);
    ctx.fillText(moment.utc(moment.unix(data.daily[2].dt + data.timezone_offset)).format("ddd"), 330, 370);
    ctx.fillText(moment.utc(moment.unix(data.daily[3].dt + data.timezone_offset)).format("ddd"), 450, 370);
    ctx.fillText(moment.utc(moment.unix(data.daily[4].dt + data.timezone_offset)).format("ddd"), 578, 370);
    ctx.fillText(moment.utc(moment.unix(data.daily[5].dt + data.timezone_offset)).format("ddd"), 700, 370);
    ctx.fillText(moment.utc(moment.unix(data.daily[6].dt + data.timezone_offset)).format("ddd"), 825, 370);

    // Daily icons
    const day0 = await loadImage(`${iconURL}/${data.daily[0].weather[0].icon}@2x.png`);
    const day1 = await loadImage(`${iconURL}/${data.daily[1].weather[0].icon}@2x.png`);
    const day2 = await loadImage(`${iconURL}/${data.daily[2].weather[0].icon}@2x.png`);
    const day3 = await loadImage(`${iconURL}/${data.daily[3].weather[0].icon}@2x.png`);
    const day4 = await loadImage(`${iconURL}/${data.daily[4].weather[0].icon}@2x.png`);
    const day5 = await loadImage(`${iconURL}/${data.daily[5].weather[0].icon}@2x.png`);
    const day6 = await loadImage(`${iconURL}/${data.daily[6].weather[0].icon}@2x.png`);

    // Position icons
    ctx.drawImage(day0, 60, 370, 100, 100);
    ctx.drawImage(day1, 184, 370, 100, 100);
    ctx.drawImage(day2, 306, 370, 100, 100);
    ctx.drawImage(day3, 427, 370, 100, 100);
    ctx.drawImage(day4, 563, 370, 100, 100);
    ctx.drawImage(day5, 687, 370, 100, 100);
    ctx.drawImage(day6, 810, 370, 100, 100);

    // Daily temperature text (max)
    ctx.font = "30px Inter";
    ctx.fillText(`${Math.round(data.daily[0].temp.max)}°`, 83, 485);
    ctx.fillText(`${Math.round(data.daily[1].temp.max)}°`, 210, 485);
    ctx.fillText(`${Math.round(data.daily[2].temp.max)}°`, 334, 485);
    ctx.fillText(`${Math.round(data.daily[3].temp.max)}°`, 453, 485);
    ctx.fillText(`${Math.round(data.daily[4].temp.max)}°`, 590, 485);
    ctx.fillText(`${Math.round(data.daily[5].temp.max)}°`, 710, 485);
    ctx.fillText(`${Math.round(data.daily[6].temp.max)}°`, 832, 485);

    // Daily temperature text (min)
    ctx.fillStyle = "#accae0";
    ctx.fillText(`${Math.round(data.daily[0].temp.min)}°`, 83, 521);
    ctx.fillText(`${Math.round(data.daily[1].temp.min)}°`, 210, 521);
    ctx.fillText(`${Math.round(data.daily[2].temp.min)}°`, 334, 521);
    ctx.fillText(`${Math.round(data.daily[3].temp.min)}°`, 453, 521);
    ctx.fillText(`${Math.round(data.daily[4].temp.min)}°`, 590, 521);
    ctx.fillText(`${Math.round(data.daily[5].temp.min)}°`, 710, 521);
    ctx.fillText(`${Math.round(data.daily[6].temp.min)}°`, 832, 521);

    // Create and send attachment
    const attachment = new MessageAttachment(canvas.toBuffer(), "forecast.png");
    message.channel.send(attachment);
};

exports.config = {
    aliases: [],
    enabled: true,
    guildOnly: false,
    permLevel: "User"
};

exports.help = {
    name: "forecast",
    description: "sends the weather forecast for the specified area",
    category: "info",
    usage: "forecast <city>[, country]"
};