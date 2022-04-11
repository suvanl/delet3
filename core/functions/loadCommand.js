import chalk from "chalk";
import os from "os";
import { sep } from "path";

export default client => {
    client.loadCommand = async (cmdPath, name) => {
        try {
            const props = await import(`${os.platform() === "win32" ? "file://" : ""}${cmdPath}${sep}${name}`);
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