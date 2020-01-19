const { blue, red } = require("chalk");

module.exports = client => {
    client.loadCommand = commandName => {
        try {
            client.logger.log(`✔ "${blue(commandName)}"`);
            const props = require(`../../commands${commandName}`);
            if (props.init) props.init(client);
            client.commands.set(props.help.name, props);
            props.conf.aliases.forEach(alias => {
                client.aliases.set(alias, props.help.name);
            });
            return false;
        } catch (error) {
            return `Unable to load command ${red(commandName)}: ${error}`;
        }
    };
};