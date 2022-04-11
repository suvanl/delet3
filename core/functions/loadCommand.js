import chalk from "chalk";
import { sep } from "path";

export default client => {
    client.loadCommand = (cmdPath, name) => {
        try {
            const props = require(`${cmdPath}${sep}${name}`);
            props.config.location = cmdPath;
            if (props.init) props.init(client);
            client.commands.set(props.help.name, props);
            props.config.aliases.forEach(alias => {
                client.aliases.set(alias, props.help.name);
            });
            client.logger.log(`✔ "${chalk.blue(name)}"`);
            return true;
        } catch (error) {
            return `Unable to load command ${chalk.red(name)}: ${error}`;
        }
    };
};