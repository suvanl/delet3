const Canvas = require("canvas");
const { MessageAttachment } = require("discord.js");

exports.run = async (client, message) => {
    const settings = await client.getSettings(message.guild);
    const basePath = `${process.cwd()}/assets/img/settings`;

    const locale = { "en-GB": "English (UK)" };
    const tf = { true: "✓", false: "X" };

    const canvas = Canvas.createCanvas(500, 1000);
    const ctx = canvas.getContext("2d");
    const background = await Canvas.loadImage(`${basePath}/base.png`);

    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

    ctx.font = "22px Montserrat Semibold";
    ctx.fillStyle = "#fff";

    // Section 1
    ctx.fillText(tf[settings.autoRoleEnabled], canvas.width / 3.1, canvas.height / 6.6);
    ctx.fillText(tf[settings.modLogEnabled], canvas.width / 3.1, canvas.height / 4.75);
    ctx.fillText(tf[settings.modLogEnabled], canvas.width / 3.1, canvas.height / 3.75);

    // Section 2
    ctx.fillText(settings.prefix, canvas.width / 4.3, canvas.height / 2.9);

    // Section 3
    ctx.fillText(settings.adminRole, canvas.width / 2.8, canvas.height / 2.35);
    ctx.fillText(settings.modRole, canvas.width / 2.8, canvas.height / 2.05);
    ctx.fillText(settings.autoRoleName, canvas.width / 2.8, canvas.height / 1.85);

    // Section 4
    ctx.fillText(`#${settings.modLogChannel}`, canvas.width / 1.9, canvas.height / 1.617);
    ctx.font = "14px Montserrat Semibold";
    ctx.fillText(settings.modLogData.join("\n"), canvas.width / 1.9, canvas.height / 1.52);
    
    // Section 5
    ctx.font = "22px Montserrat Semibold";
    ctx.fillText(`#${settings.welcomeChannel}`, canvas.width / 1.85, canvas.height / 1.32);
    ctx.font = "14px Montserrat Semibold";
    ctx.fillText(settings.welcomeMessage, canvas.width / 1.85, canvas.height / 1.225);

    // Section 6
    ctx.font = "22px Montserrat Semibold";
    ctx.fillText(locale[settings.language], canvas.width / 2.95, canvas.height / 1.112);

    // Send as attachment
    const attachment = new MessageAttachment(canvas.toBuffer(), "settings.png");
    message.channel.send(attachment);
    
};

exports.config = {
    aliases: ["set"],
    enabled: true,
    guildOnly: true,
    permLevel: "Server Moderator"
};

exports.help = {
    name: "settings",
    description: "displays the current server's settings",
    category: "settings",
    usage: "settings"
};