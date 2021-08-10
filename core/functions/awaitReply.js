module.exports = client => {
    client.awaitReply = async (msg, question, limit = 60000) =>  {
        // await messages from the message author only
        const filter = m => m.author.id === msg.author.id;

        // send the prompt/question message
        await msg.channel.send(question);

        try {
            // call awaitMessages with a maximum of 1 message to collect, which times out after the specified time limit (60 sec by default)
            const collected = await msg.channel.awaitMessages({ filter, max: 1, time: limit, errors: ["time"] });

            // return the contents of the user's response
            return collected.first().content;
        } catch (err) {
            return false;
        }
    };
};