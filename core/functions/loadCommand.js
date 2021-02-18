const { blue, red } = require("chalk");
const { sep } = require("path");

module.exports = client => {
    client.loadCommand = (cmdPath, name) => {
        try {
            const props = require(`${cmdPath}${sep}${name}`);
            props.config.location = cmdPath;
            if (props.init) props.init(client);
            client.commands.set(props.help.name, props);
            props.config.aliases.forEach(alias => {
                client.aliases.set(alias, props.help.name);
            });
            client.logger.log(`✔ "${blue(name)}"`);
            return true;
        } catch (error) {
            return `Unable to load command ${red(name)}: ${error}`;
        }
    };
};