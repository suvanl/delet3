import fetch from "node-fetch";
import { ActionRowBuilder, ApplicationCommandOptionType, ButtonBuilder, ButtonStyle, ChannelType, EmbedBuilder } from "discord.js";
import { decode } from "html-entities";
import { stripIndents } from "common-tags";
import { triviaCategoryData } from "../../../core/util/data";

export const run = async (client, interaction) => {
    const difficulty = interaction.options.getString("difficulty");
    const category = interaction.options.getNumber("category");

    const url = `https://opentdb.com/api.php?amount=1&category=${category}&difficulty=${difficulty}`;

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

        // Create embed
        const embed = new EmbedBuilder()
            .setAuthor({ name: "Trivia", iconURL: "https://i.imgur.com/Z20hATC.png" })
            .setColor("#6f99ff")
            .setDescription(stripIndents`
                **${client.l10n(interaction, "trivia.embed.question")}**
                ${decode(quiz.question)}

                ${decode(options)}

                **${client.l10n(interaction, "trivia.embed.catdiff")}**
                ${quiz.category} | ${quiz.difficulty.toTitleCase()}`)
            .setFooter({ text: client.l10n(interaction, "trivia.embed.footer"), iconURL: interaction.user.displayAvatarURL() })
            .setTimestamp();

        // Create buttons
        const btnTrue = new ButtonBuilder()
            .setCustomId("btnTrue")
            .setLabel("True")
            .setStyle(ButtonStyle.Primary);

        const btnFalse = new ButtonBuilder()
            .setCustomId("btnFalse")
            .setLabel("False")
            .setStyle(ButtonStyle.Primary);

        const btnA = new ButtonBuilder()
            .setCustomId("btnA")
            .setLabel("A")
            .setStyle(ButtonStyle.Primary);

        const btnB = new ButtonBuilder()
            .setCustomId("btnB")
            .setLabel("B")
            .setStyle(ButtonStyle.Primary);

        const btnC = new ButtonBuilder()
            .setCustomId("btnC")
            .setLabel("C")
            .setStyle(ButtonStyle.Primary);

        const btnD = new ButtonBuilder()
            .setCustomId("btnD")
            .setLabel("D")
            .setStyle(ButtonStyle.Primary);

        const btnCancel = new ButtonBuilder()
            .setCustomId("btnCancel")
            .setLabel("Cancel")
            .setEmoji("<:x_:688400118327672843>")
            .setStyle(ButtonStyle.Danger);

        // Create ActionRow with buttons based on the quiz type
        const row = new ActionRowBuilder()
            .addComponents(quiz.type === "boolean" ? [btnTrue, btnFalse, btnCancel] : [btnA, btnB, btnC, btnD, btnCancel]);

        // Send embed and buttons
        await interaction.reply({ embeds: [embed], components: [row] });

        // Handle button clicks:
        // Define custom IDs array and create filter function to check whether the ButtonInteraction includes these IDs, and to ensure that
        // only the user who initiated the interaction can use these buttons
        const btnCustomIDs = quiz.type === "boolean" ? ["btnTrue", "btnFalse", "btnCancel"] : ["btnA", "btnB", "btnC", "btnD", "btnCancel"];
        const filter = i => btnCustomIDs.includes(i.customId) && i.user.id === interaction.user.id;

        // Create a new message component collector in the channel using this filter function
        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000, idle: 60000, dispose: true });
        collector.on("collect", async i => {
            // If cancel button is clicked
            if (i.customId === "btnCancel") {
                await i.update({ content: "Trivia question cancelled.", embeds: [], components: [] });
                collector.stop("User cancelled");
            }

            // If quiz type is multiple choice...
            if (quiz.type !== "boolean") {
                const choices = { "btnA": 0, "btnB": 1, "btnC": 2, "btnD": 3 };
                const index = choices[i.customId];
                const selectedChoice = randomisedChoices[index];

                // If answer is wrong
                if (selectedChoice !== quiz.correct_answer) return await handleWrongAns(client, interaction, i, collector, quiz, selectedChoice);

                // If answer is correct
                return await handleCorrectAns(client, interaction, difficulty, i, collector);
            }

            // If quiz type is boolean...
            const selectedChoice = i.customId.slice(3);
            if (quiz.correct_answer === selectedChoice) return await handleCorrectAns(client, interaction, difficulty, i, collector);
            return await handleWrongAns(client, interaction, i, collector, quiz, selectedChoice);
        });

        // collector.on("end", async (collected, reason) => client.logger.debug(reason));
    } catch (err) {
        client.logger.error(err.stack);
        return interaction.reply(client.l10n(interaction, "error"));
    }
};

const handleWrongAns = async (client, interaction, collected, collector, quiz, choice) => {
    // Define "wrong answer" message
    const msg = stripIndents`<:x_:688400118327672843> **${client.l10n(interaction, "trivia.ans.wrong")}**
    ${client.l10n(interaction, "trivia.ans.info").replace(/%ans%/g, decode(quiz.correct_answer)).replace(/%choice%/g, choice)}`;

    // Send the "wrong answer" message and stop the message collector with the reason "Answered - wrong"
    await collected.update({ content: msg, embeds: [], components: [] });
    return collector.stop("Answered - wrong");
};

const handleCorrectAns = async (client, interaction, difficulty, collected, collector) => {
    // Define "correct answer" message
    let msg = stripIndents`<:tick:688400118549970984> **${client.l10n(interaction, "trivia.ans.correct")}**
    ${client.l10n(interaction, "trivia.ans.gg")}`;

    // Add points (if in a guild text channel)
    if (interaction.channel.type === ChannelType.GuildText) {
        const points = { "easy": 1, "medium": 2, "hard": 3 };

        const { triviaPoints } = await client.getUser(interaction.guild, interaction.user);
        const newTotal = triviaPoints + points[difficulty];
        await client.addPoints(interaction.guild, interaction.user, "triviaPoints", newTotal);

        // Define the word for "point"/"points" in the current locale
        const pointWord = client.l10n(interaction, "point");
        const pointsWord = client.l10n(interaction, "points");

        // Send "correct answer" message with number of points gained
        await collected.update({ content: msg += ` [+${points[difficulty]} ${points[difficulty] === 1 ? pointWord : pointsWord}]`, embeds: [], components: [] });
        return collector.stop("Answered - correct");
    }

    // Send "correct answer" message
    await collected.update({ content: msg, embeds: [], components: [] });
    return collector.stop("Answered - correct");
};

export const data = {
    name: "trivia",
    description: "Test your knowledge on a topic of your choice",
    options: [{
        name: "difficulty",
        type: ApplicationCommandOptionType.String,
        description: "The difficulty of the question",
        required: true,
        choices: [
            { name: "easy", value: "easy" },
            { name: "medium", value: "medium" },
            { name: "hard", value: "hard" }
        ]
    },
    {
        name: "category",
        type: ApplicationCommandOptionType.Number,
        description: "The category (topic) of the question",
        required: true,
        choices: triviaCategoryData
    }],
    dm_permission: true
};

export const global = true;
