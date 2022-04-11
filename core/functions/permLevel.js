export default client => {
    client.permLevel = message => {
        let prmLvl = 0;

        const permOrder = client.permLevels.levels.slice(0).sort((p, c) => p.level < c.level ? 1 : -1);
        while (permOrder.length) {
            const currentLevel = permOrder.shift();
            if (message.guild && currentLevel.guildOnly) continue;
            if (currentLevel.verify(message)) {
                prmLvl = currentLevel.level;
                break;
            }
        }

        return prmLvl;
    };
};