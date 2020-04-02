const fetch = require("node-fetch");
const Entities = require("html-entities").AllHtmlEntities;
const { MessageEmbed } = require("discord.js");
const { stripIndents } = require("common-tags");
const { categories } = require("../../core/util/data");

const e = new Entities();

exports.run = async (client, message, args) => {
    // Send list of available categories
    if (args[0] && args[0].toLowerCase() === "categories") {
        const catArr = Array.from(Object.keys(categories));
        const catList = catArr.map(c => `\`${c}\``).join(", ");
        return message.channel.send(`📋 **Available categories**\n${catList}`);
    }

    // Let user know how many points they have
    const userData = await client.getUser(message.author);
    const currentPoints = userData.triviaPoints;
    if (args[0] && args[0].toLowerCase() === "points") return message.reply(`you currently have \`${currentPoints}\` trivia points.`);

    // Send trivia leaderboard
    const lbAliases = ["leaderboard", "lb"];
    if (lbAliases.includes(args[0] && args[0].toLowerCase())) {
        // Return if leaderboard/lb arg is used in DMs
        if (message.channel.type !== "text") return message.channel.send("🚫 Leaderboard is unavailable in DMs.");

        // Fetch all users
        const all = await client.getUsers();

        // Filter out users who aren't in this guild, as well as users who have 0 triviaPoints
        const filtered = all.filter(a => a.guildID === message.guild.id && a.triviaPoints >= parseInt(1));

        // Sort filtered users by number of trivia points
        const sorted = filtered.sort((a, b) => {
            if (a.triviaPoints < b.triviaPoints) return 1;
            else return -1;
        });

        console.log(sorted);

        // Create leaderboard
        let lbMsg = `🔢 **Trivia Leaderboard** for ${message.guild.name}\n\n`;
        if (filtered.length === 0) lbMsg += `All users here have **0** points.\nUse the \`${message.settings.prefix}trivia\` command to earn some!`;

        let index = 0;
        const lb = sorted.map(async m => {
            const u = await client.users.fetch(m.userID);
            return `**${++index}** | ${u.username}#${u.discriminator} - **${m.triviaPoints}** points`;
        });

        // Send leaderboard
        return Promise.all(lb).then(res => {
            lbMsg += res.join("\n");
            
            const embed = new MessageEmbed()
                .setColor(filtered.length === 0 ? "#ff8d6f" : "#6fe1ff")
                .setDescription(lbMsg);

            message.channel.send(embed);
        });
    }

    // Define available levels of difficulty
    const levels = ["easy", "medium", "hard"];

    // Set difficulty
    const d = args[0] || "medium";

    // Inform user if invalid difficulty is specified
    if (!levels.includes(d.toLowerCase())) return message.channel.send(stripIndents`
        ⚠️ **Invalid difficulty**
        Please choose from one of ${levels.map(l => `\`${l}\``).join("/")}.`);

    // Define category as all words including + after args[1]; converted to valid number
    let cat = args.slice(1).join(" ");
    if (cat.toLowerCase().includes("and")) cat = args.slice(1).join(" ").replace(/and/g, "&");

    const c = categories[cat.toTitleCase()] || 0;

    // Inform user if invalid category is specified
    if (args[1] && !c) return message.channel.send(stripIndents`
        ⚠️ **Invalid category**
        Use \`${message.settings.prefix}trivia categories\` to see a list of available categories.`);

    // Interpolate difficulty & category info into URL string
    const url = `https://opentdb.com/api.php?amount=1&category=${c}&difficulty=${d.toLowerCase()}`;

    try {
        // Fetch data from Open Trivia DB API
        const res = await fetch(url);
        const data = await res.json();
        const quiz = data.results[0];

        console.log(quiz);

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

        // Create MessageEmbed object
        const embed = new MessageEmbed()
            .setAuthor("Trivia", "https://i.imgur.com/Z20hATC.png")
            .setColor("#6f99ff")
            .setDescription(stripIndents`
                **Question**
                ${e.decode(quiz.question)}

                ${e.decode(options)}

                **Category & Difficulty**
                ${quiz.category} | ${quiz.difficulty.toTitleCase()}
            `)
            .setFooter("Answer within 60 seconds!", message.author.displayAvatarURL())
            .setTimestamp();
        
        // Wait 60 seconds (awaitReply default "limit" property value) for user's answer
        const userAns = await client.awaitReply(message, embed);

        // Send "timed out" message
        if (!userAns) return message.channel.send(stripIndents`
            <a:alarm:688395323458322438> **Time's up!**
            Trivia session timed out as you did not answer within 60 seconds.`);

        // Set choices based on quiz type
        let choice = randomisedChoices[["a", "b", "c", "d"].indexOf(userAns.toLowerCase())];
        if (quiz.type === "boolean") choice = userAns.toTitleCase();

        const bool = ["True", "False"];

        const invalid = stripIndents`
            ⚠️ **Invalid answer**
            The correct answer was \`${quiz.correct_answer}\`.`;

        // Send "invalid" message if answer doesn't match one of the valid choices
        if (quiz.type === "multiple" && !choice || quiz.type === "boolean" && !bool.includes(userAns.toTitleCase())) return message.channel.send(invalid);  

        // If choice matches correct answer:
        if (choice === quiz.correct_answer) {
            // Define correct answer message
            let correct = stripIndents`
                <:tick:688400118549970984> **Correct answer**
                Well done!`;

            // Add points (if in a guild text channel)
            if (message.channel.type === "text") {
                const dif = d.toLowerCase();
                const points = { "easy": 1, "medium": 2, "hard": 3 };

                const newTotal = currentPoints + points[dif];

                await client.addPoints(message.author, "triviaPoints", newTotal);

                // Send "correct answer" message with number of points gained
                message.channel.send(correct += ` [+${points[dif]} ${points[dif] === 1 ? "point" : "points"}]`);
            } else {
                // Send "correct answer" message
                message.channel.send(correct);
            }
            
        }
        // Else, their answer must be incorrect
        else return message.channel.send(stripIndents`
            <:x_:688400118327672843> **Incorrect answer**
            The correct answer was \`${quiz.correct_answer}\`; you chose \`${choice}\`. Don't give up, though - try again!`);
    } catch (err) {
        client.logger.err(err.stack);
        message.channel.send("An error occurred.");
    }
};

exports.config = {
    aliases: ["quiz"],
    enabled: true,
    guildOnly: false,
    permLevel: "User"
};

exports.help = {
    name: "trivia",
    description: "tests your knowledge on a topic of your choice",
    category: "fun",
    usage: "trivia [difficulty] [category]"
};