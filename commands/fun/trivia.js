const fetch = require("node-fetch");
const { MessageEmbed } = require("discord.js");
const { stripIndents } = require("common-tags");

exports.run = async (client, message) => {
    const url = "https://opentdb.com/api.php?amount=1&type=boolean";
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
                ${quiz.question.decodeEntities()}

                ${options}

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

        // If choice matches correct answer, send "correct answer" message
        if (choice === quiz.correct_answer) return message.channel.send(stripIndents`
            <:tick:688400118549970984> **Correct answer**
            Well done!`);
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
    guildOnly: true, // todo: set up conditional for adding points (so that points can only be earned fairly in guilds), then this can be set to false
    permLevel: "User"
};

exports.help = {
    name: "trivia",
    description: "tests your knowledge on a topic of your choice",
    category: "fun",
    usage: "trivia"
};