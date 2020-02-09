const { blue, red } = require("chalk");

module.exports = client => {
    client.loadCommand = commandName => {
        try {
            const props = require(`../../commands/${commandName}`);
            if (props.init) props.init(client);
            client.commands.set(props.help.name, props);
            props.config.aliases.forEach(alias => {
                client.aliases.set(alias, props.help.name);
            });
            client.logger.log(`✔ "${blue(commandName)}"`);
            return false;
        } catch (error) {
            return `Unable to load command ${red(commandName)}: ${error}`;
        }
    };
};