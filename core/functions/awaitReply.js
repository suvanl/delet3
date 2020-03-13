module.exports = client => {
    client.awaitReply = async (msg, question, limit = 60000) =>  {
        const filter = m = m.author.id === msg.author.id;
        await msg.channel.send(question);
        try {
            const collected = await msg.channel.awaitMessages(filter, { max: 1, time: limit, errors: ["time"] });
            return collected.first().content;
        } catch (err) {
            return false;
        }
    };
};