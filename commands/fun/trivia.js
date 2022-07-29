import fetch from "node-fetch";
import { decode } from "html-entities";
import { ChannelType, EmbedBuilder } from "discord.js";
import { stripIndents } from "common-tags";
import { categories } from "../../core/util/data";

export const run = async (client, message, args) => {
    // Send list of available categories
    if (args[0] && args[0].toLowerCase() === "categories") {
        const catArr = Array.from(Object.keys(categories));
        const catList = catArr.map(c => `\`${c}\``).join(", ");
        return message.channel.send(`📋 **${client.l10n(message, "trivia.categories")}**\n${catList}`);
    }

    // Let user know how many points they have
    if (message.channel.type === ChannelType.GuildText) {
        const userData = await client.getUser(message.guild, message.author);
        const currentPoints = userData.triviaPoints;
        if (args[0] && args[0].toLowerCase() === "points") return message.reply(client.l10n(message, "trivia.points").replace(/%num%/g, currentPoints));
    }

    // Send trivia leaderboard
    const lbAliases = ["leaderboard", "lb"];
    if (lbAliases.includes(args[0] && args[0].toLowerCase())) {
        // Return if leaderboard/lb arg is used in DMs
        if (message.channel.type !== ChannelType.GuildText) return message.channel.send(`🚫 ${client.l10n(message, "trivia.dmlb")}`);

        // Fetch all users
        const all = await client.getUsers();

        // Filter out users who aren't in this guild, as well as users who have 0 triviaPoints
        const filtered = all.filter(a => a.guildID === message.guild.id && a.triviaPoints >= parseInt(1));

        // Sort filtered users by number of trivia points
        const sorted = filtered.sort((a, b) => a.triviaPoints < b.triviaPoints ? 1 : -1);

        // Create leaderboard
        let lbMsg = `🔢 ${client.l10n(message, "trivia.lb.header").replace(/%name%/g, message.guild.name)}\n\n`;
        if (filtered.length === 0) lbMsg += stripIndents`
            ${client.l10n(message, "trivia.lb.empty")}
            ${client.l10n(message, "trivia.lb.emptyInfo").replace(/%cmd%/g, `${message.settings.prefix}trivia`)}`;

        let index = 0;
        const lb = sorted.map(async m => {
            const u = await client.users.fetch(m.userID);
            return `**${++index}** | ${u.username}#${u.discriminator} - **${m.triviaPoints}** ${client.l10n(message, "points")}`;
        });

        // Send leaderboard
        return Promise.all(lb).then(res => {
            lbMsg += res.join("\n");
            
            const embed = new EmbedBuilder()
                .setColor(filtered.length === 0 ? "#ff8d6f" : "#6fe1ff")
                .setDescription(lbMsg);

            message.channel.send({ embeds: [embed] });
        });
    }

    // Define available levels of difficulty
    const levels = ["easy", "medium", "hard"];

    // Set difficulty
    const d = args[0] || "medium";

    // Inform user if invalid difficulty is specified:
        // ⚠️ Invalid difficulty
        // Please choose from one of easy/medium/hard
    if (!levels.includes(d.toLowerCase())) return message.channel.send(stripIndents`
        ⚠️ **${client.l10n(message, "trivia.diff.invalid")}**
        ${client.l10n(message, "trivia.diff.list").replace(/%lvls%/g, levels.map(l => `\`${l}\``).join("/"))}.`);

    // Define category as all words including + after args[1]; converted to valid number
    let cat = args.slice(1).join(" ");
    if (cat.toLowerCase().includes("and")) cat = args.slice(1).join(" ").replace(/and/g, "&");

    const c = categories[cat.toTitleCase()] || 0;

    // Inform user if invalid category is specified:
        // ⚠️ Invalid category
        // Use %trivia categories to see a list of available categories.
    if (args[1] && !c) return message.channel.send(stripIndents`
        ⚠️ **${client.l10n(message, "trivia.cat.invalid")}**
        ${client.l10n(message, "trivia.cat.help").replace(/%cmd%/g, `\`${message.settings.prefix}trivia categories\``)}`);

    // Interpolate difficulty & category info into URL string
    const url = `https://opentdb.com/api.php?amount=1&category=${c}&difficulty=${d.toLowerCase()}`;

    try {
        // Fetch data from Open Trivia DB API
        const res = await fetch(url);
        const data = await res.json();
        const quiz = data.results[0];

        // Set possible choices as all incorrect answers + correct answer
        const choices = quiz.incorrect_answers;
        choices.push(quiz.correct_answer);

        // Randomise order of choices
        const randomisedChoices = new Array(4);
        for (let i = 0; i < 4; i++) {
            randomisedChoices[i] = choices.random();
            choices.splice(choices.indexOf(randomisedChoices[i]), 1);
        }

        // Format possible options
        let options = stripIndents`
            :regional_indicator_a: ${randomisedChoices[0]}
            :regional_indicator_b: ${randomisedChoices[1]}
            :regional_indicator_c: ${randomisedChoices[2]}
            :regional_indicator_d: ${randomisedChoices[3]}`;

        if (quiz.type === "boolean") options = "**TRUE** or **FALSE**?";

        // Create EmbedBuilder object:
            // Question
            // [question text]
            //
            // [options]
            //
            // Category & Difficulty
            // cat | diff
        const embed = new EmbedBuilder()
            .setAuthor({ name: "Trivia", iconURL: "https://i.imgur.com/Z20hATC.png" })
            .setColor("#6f99ff")
            .setDescription(stripIndents`
                **${client.l10n(message, "trivia.embed.question")}**
                ${decode(quiz.question)}

                ${decode(options)}

                **${client.l10n(message, "trivia.embed.catdiff")}**
                ${quiz.category} | ${quiz.difficulty.toTitleCase()}`)
            .setFooter({ text: client.l10n(message, "trivia.embed.footer"), iconURL: message.author.displayAvatarURL() })
            .setTimestamp();
        
        // Wait 60 seconds (awaitReply default "limit" property value) for user's answer
        const userAns = await client.awaitReply(message, { embeds: [embed] });

        // Send "timed out" message:
            // ⏰ Time's up!
            // Trivia session timed out as you did not answer within 60 seconds.
        if (!userAns) return message.channel.send(stripIndents`
            <a:alarm:688395323458322438> **${client.l10n(message, "trivia.timeout")}**
            ${client.l10n(message, "trivia.timeout.info")}`);

        // Set choices based on quiz type
        let choice = randomisedChoices[["a", "b", "c", "d"].indexOf(userAns.toLowerCase())];
        if (quiz.type === "boolean") choice = userAns.toTitleCase();

        const bool = ["True", "False"];

        // Define invalid answer message:
            // ⚠️ Invalid answer
            // The correct answer was [ans].
        const invalid = stripIndents`
            ⚠️ **${client.l10n(message, "trivia.ans.invalid")}**
            ${client.l10n(message, "trivia.ans").replace(/%ans%/g, decode(quiz.correct_answer))}`;

        // Send "invalid" message if answer doesn't match one of the valid choices
        if (quiz.type === "multiple" && !choice || quiz.type === "boolean" && !bool.includes(userAns.toTitleCase())) return message.channel.send(invalid);  

        // If choice matches correct answer:
        if (choice === quiz.correct_answer) {
            // Define correct answer message:
                // ✅ Correct answer
                // Well done!
            let correct = stripIndents`
                <:tick:688400118549970984> **${client.l10n(message, "trivia.ans.correct")}**
                ${client.l10n(message, "trivia.ans.gg")}`;

            // Add points (if in a guild text channel)
            if (message.channel.type === ChannelType.GuildText) {
                const dif = d.toLowerCase();
                const points = { "easy": 1, "medium": 2, "hard": 3 };

                const userData = await client.getUser(message.guild, message.author);
                const currentPoints = userData.triviaPoints;

                const newTotal = currentPoints + points[dif];

                await client.addPoints(message.guild, message.author, "triviaPoints", newTotal);

                // Send "correct answer" message with number of points gained:
                // First, define the word for "point"/"points" in the current locale
                const pointWord = client.l10n(message, "point");
                const pointsWord = client.l10n(message, "points");

                // Then, send the message
                message.channel.send(correct += ` [+${points[dif]} ${points[dif] === 1 ? pointWord : pointsWord}]`);
            } else {
                // Send "correct answer" message
                message.channel.send(correct);
            }
        }
        // Else, their answer must be incorrect - send the incorrect answer message:
            // ❌ Incorrect answer
            // The correct answer was [correct_ans]; you chose [choice]. Don't give up, though - try again!
        else return message.channel.send(stripIndents`
            <:x_:688400118327672843> **${client.l10n(message, "trivia.ans.wrong")}**
            ${client.l10n(message, "trivia.ans.info").replace(/%ans%/g, decode(quiz.correct_answer)).replace(/%choice%/g, choice)}`);
    } catch (err) {
        client.logger.error(err.stack);
        return message.channel.send(client.l10n(message, "error"));
    }
};

export const config = {
    aliases: ["quiz"],
    enabled: true,
    guildOnly: false,
    permLevel: "User"
};

export const help = {
    name: "trivia",
    description: "tests your knowledge on a topic of your choice",
    category: "fun",
    usage: "trivia [difficulty] [category]|points|leaderboard"
};