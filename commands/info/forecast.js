import fetch from "node-fetch";
import Canvas from "canvas";
import { DateTime } from "luxon";
import { MessageAttachment } from "discord.js";
import { stripIndents } from "common-tags";
import { sep } from "path";

const { OWM_KEY } = process.env;

export const run = async (client, message, args) => {
    // Define location
    let location = args.join(" ");

    // If no location is provided, return & inform user
    if (!location) return message.reply(stripIndents`
        ℹ️ ${client.l10n(message, "forecast.noLocation")}
        📖 ${client.l10n(message, "forecast.example").replace(/%cmd%/g, `${message.settings.prefix}forecast`)}.`);

    // If location contains apostrophe, ensure it is a valid one.
    // This specific character replacement fixes an issue where the iOS keyboard
    // autocorrects ' to ‘, resulting in an invalid location being provided to OpenWeatherMap.
    if (location.includes("‘")) location = location.replace(/‘/g, "'");

    // Encode location as URI component
    const loc = encodeURIComponent(location);

    // Get two-letter language code for the "lang" parameter in the API request
    const lang = message.settings.language.slice(0, 2) || "en";

    // Get lat/lon and location values from current weather data
    const current = await getCurrent(loc, lang, OWM_KEY);

    // Define error message template
    const errMsg = stripIndents`
        ⚠️ **${client.l10n(message, "weather.404.error").replace(/%err%/g, `${current.cod} ${current.message}`)}**

        ➡️ ${client.l10n(message, "weather.404.valid")}
        ℹ️ ${client.l10n(message, "weather.404.help").replace(/%cmd%/g, `${message.settings.prefix}help forecast`)}`;

    // Inform user if 404 occurs
    if (current.cod === "404") return message.reply({ content: errMsg, ephemeral: true });

    const { lat, lon } = current.coord;
    const { country } = current.sys;
    const { name } = current;

    // Get forecast data
    const data = await getForecast(lat, lon, lang, OWM_KEY);

    // If using a regular command, start typing to indicate image is being generated.
    // Typing stops after 10 seconds, or once the message has been sent.
    if (message.type !== "APPLICATION_COMMAND")
        message.channel.sendTyping();
    // If using an application command, defer the response
    else
        await message.deferReply();

    // #region IMAGE GENERATION

    // Create canvas
    const canvas = Canvas.createCanvas(988, 627);
    const ctx = canvas.getContext("2d");

    // Locate assets directory
    const assetsDir = `${process.cwd()}${sep}assets`;

    // Define background image locations
    const dayBg = `${assetsDir}${sep}forecast${sep}forecast-day.png`;
    const nightBg = `${assetsDir}${sep}forecast${sep}forecast-night.png`;

    // Define icon base URL
    const iconURL = "https://openweathermap.org/img/wn";

    // Define day/night main fillStyle
    const mainFillStyle = isNight(data) ? "#aaaab2" : "#ffffff";

    // Set background image
    const background = isNight(data) ? await Canvas.loadImage(nightBg) : await Canvas.loadImage(dayBg);
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

    // Register Inter font variants
    Canvas.registerFont(`${assetsDir}${sep}fonts${sep}Inter-Regular-slnt=0.ttf`, { family: "Inter" });
    Canvas.registerFont(`${assetsDir}${sep}fonts${sep}Inter-Bold-slnt=0.ttf`, { family: "Inter Bold" });

    // Heading
    ctx.font = "40px Inter Bold";
    ctx.fillStyle = isNight(data) ? "#d2d2d2" : "#ffffff";
    ctx.fillText(`${name}, ${country}`, 73, 102);

    // Current day and conditions

    ctx.font = "30px Inter Bold";
    ctx.fillStyle = mainFillStyle;
    ctx.fillText(`${DateTime.fromSeconds(data.current.dt + data.timezone_offset).toUTC().toFormat("cccc")}, ${data.current.weather[0].description}`, 73, 200);

    // Icon
    const currentIcon = await Canvas.loadImage(`${iconURL}/${data.current.weather[0].icon}@2x.png`);
    ctx.drawImage(currentIcon, 47, 202, 100, 100);

    // Current max temp
    ctx.font = "60px Inter Bold";
    ctx.fillText(`${("0" + Math.round(data.daily[0].temp.max)).slice(-2)}`, 150, 275); // alt 160

    // degrees C
    ctx.font = "30px Inter";
    ctx.fillStyle = isNight(data) ? "#8d8d97" : "#d9e7f1";
    ctx.fillText("°C", 229, 253); // alt 239

    // Current min temp
    ctx.font = "60px Inter Bold";
    ctx.fillStyle = isNight(data) ? "#656569" : "#8eb5d2";
    ctx.fillText(`${("0" + Math.round(data.daily[0].temp.min)).slice(-2)}`, 311, 275);

    // degrees C
    ctx.font = "30px Inter";
    ctx.fillText("°C", 390, 253);

    // H o u r l y   f o r e c a s t

    ctx.font = "16px Inter Bold";
    ctx.fillStyle = mainFillStyle;

    // Hours
    ctx.fillText(DateTime.fromSeconds(data.hourly[1].dt + data.timezone_offset).toUTC().toFormat("HH:mm"), 528, 228);
    ctx.fillText(DateTime.fromSeconds(data.hourly[2].dt + data.timezone_offset).toUTC().toFormat("HH:mm"), 598, 228);
    ctx.fillText(DateTime.fromSeconds(data.hourly[3].dt + data.timezone_offset).toUTC().toFormat("HH:mm"), 668, 228);
    ctx.fillText(DateTime.fromSeconds(data.hourly[4].dt + data.timezone_offset).toUTC().toFormat("HH:mm"), 738, 228);
    ctx.fillText(DateTime.fromSeconds(data.hourly[5].dt + data.timezone_offset).toUTC().toFormat("HH:mm"), 808, 228);

    // Hourly icons
    const hour1 = await Canvas.loadImage(`${iconURL}/${data.hourly[1].weather[0].icon}.png`);
    const hour2 = await Canvas.loadImage(`${iconURL}/${data.hourly[2].weather[0].icon}.png`);
    const hour3 = await Canvas.loadImage(`${iconURL}/${data.hourly[3].weather[0].icon}.png`);
    const hour4 = await Canvas.loadImage(`${iconURL}/${data.hourly[4].weather[0].icon}.png`);
    const hour5 = await Canvas.loadImage(`${iconURL}/${data.hourly[5].weather[0].icon}.png`);

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
    ctx.fillText(DateTime.fromSeconds(data.daily[0].dt + data.timezone_offset).toUTC().toFormat("ccc"), 73, 370);
    ctx.fillText(DateTime.fromSeconds(data.daily[1].dt + data.timezone_offset).toUTC().toFormat("ccc"), 203, 370);
    ctx.fillText(DateTime.fromSeconds(data.daily[2].dt + data.timezone_offset).toUTC().toFormat("ccc"), 330, 370);
    ctx.fillText(DateTime.fromSeconds(data.daily[3].dt + data.timezone_offset).toUTC().toFormat("ccc"), 450, 370);
    ctx.fillText(DateTime.fromSeconds(data.daily[4].dt + data.timezone_offset).toUTC().toFormat("ccc"), 578, 370);
    ctx.fillText(DateTime.fromSeconds(data.daily[5].dt + data.timezone_offset).toUTC().toFormat("ccc"), 700, 370);
    ctx.fillText(DateTime.fromSeconds(data.daily[6].dt + data.timezone_offset).toUTC().toFormat("ccc"), 825, 370);

    // Daily icons
    const day0 = await Canvas.loadImage(`${iconURL}/${data.daily[0].weather[0].icon}@2x.png`);
    const day1 = await Canvas.loadImage(`${iconURL}/${data.daily[1].weather[0].icon}@2x.png`);
    const day2 = await Canvas.loadImage(`${iconURL}/${data.daily[2].weather[0].icon}@2x.png`);
    const day3 = await Canvas.loadImage(`${iconURL}/${data.daily[3].weather[0].icon}@2x.png`);
    const day4 = await Canvas.loadImage(`${iconURL}/${data.daily[4].weather[0].icon}@2x.png`);
    const day5 = await Canvas.loadImage(`${iconURL}/${data.daily[5].weather[0].icon}@2x.png`);
    const day6 = await Canvas.loadImage(`${iconURL}/${data.daily[6].weather[0].icon}@2x.png`);

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
    ctx.fillStyle = isNight(data) ? "#656569" : "#accae0";
    ctx.fillText(`${Math.round(data.daily[0].temp.min)}°`, 83, 521);
    ctx.fillText(`${Math.round(data.daily[1].temp.min)}°`, 210, 521);
    ctx.fillText(`${Math.round(data.daily[2].temp.min)}°`, 334, 521);
    ctx.fillText(`${Math.round(data.daily[3].temp.min)}°`, 453, 521);
    ctx.fillText(`${Math.round(data.daily[4].temp.min)}°`, 590, 521);
    ctx.fillText(`${Math.round(data.daily[5].temp.min)}°`, 710, 521);
    ctx.fillText(`${Math.round(data.daily[6].temp.min)}°`, 832, 521);

    // #endregion

    // Create and send attachment
    const attachment = new MessageAttachment(canvas.toBuffer(), "forecast.png");
    const filesObj = { files: [attachment] };
    
    if (message.type !== "APPLICATION_COMMAND")
        message.reply(filesObj);
    else
        message.editReply(filesObj);
};

// #region Helper Functions

// Obtains current weather data (to get lat/lon values)
const getCurrent = async (loc, lang, key) => {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${loc}&units=metric&lang=${lang}&appid=${key}`;
    const res = await fetch(url);
    return await res.json();
};


// Fetches forecast data for the specified location
const getForecast = async (lat, lon, lang, key) => {
    // Send GET request to OWM One Call API for forecast data
    const url = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&units=metric&exclude=minutely&lang=${lang}&appid=${key}`;
    const res = await fetch(url);
    return await res.json();
};


// Function returning a boolean stating whether it is night (past sunset) in the requested area
const isNight = data => {
    // Current Unix timestamp for the specified location
    const currentTime = data.current.dt + data.timezone_offset;

    // Sunrise timestamp for the specified location
    const sunriseTime = data.current.sunrise + data.timezone_offset;

    // Sunset timestamp for the specified location
    const sunsetTime = data.current.sunset + data.timezone_offset;

    // If the current time is greater than (after) the sunrise time, AND
    // the current time is less than (before) the sunset time, it must be day.
    // Else, it must be night.
    if ((currentTime > sunriseTime) && (currentTime < sunsetTime)) return false;
    else return true;
};

// #endregion

export const config = {
    aliases: [],
    enabled: true,
    guildOnly: false,
    permLevel: "User"
};

export const help = {
    name: "forecast",
    description: "sends the weather forecast for the specified area",
    category: "info",
    usage: "forecast <city>[, country]"
};