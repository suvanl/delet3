import chalk from "chalk";
import { DateTime } from "luxon";

export const log = (content, type = "log") => {
    const offset = DateTime.now().toFormat("Z");  // narrow offset
    const timestamp = `${DateTime.now().toFormat("y-MM-dd HH:mm:ss")} UTC${offset} |`;

    switch (type) {
        case "cmd": {
            return console.log(`${timestamp} ${chalk.blue(type.toUpperCase())} » ${content}`);
        }
        case "app": {
            return console.log(`${timestamp} ${chalk.magenta(type.toUpperCase())} » ${content}`);
        }
        case "dbg": {
            return console.log(`${timestamp} ${chalk.yellow(type.toUpperCase())} » ${content}`);
        }
        case "err": {
            return console.log(`${timestamp} ${chalk.bgRed(type.toUpperCase())} » ${content}`);
        }
        case "inf": {
            return console.log(`${timestamp} ${chalk.bgBlue(type.toUpperCase())} » ${content}`);
        }
        case "log": {
            return console.log(`${timestamp} ${chalk.grey(type.toUpperCase())} » ${content}`);
        }
        case "rdy": {
            return console.log(`${timestamp} ${chalk.green(type.toUpperCase())} » ${content}`);
        }
        case "wrn": {
            return console.log(`${timestamp} ${chalk.bgYellow(type.toUpperCase())} » ${content}`);
        }
        default: throw new TypeError("Invalid logger type.");
    }
};

export const cmd = (...args) => log(...args, "cmd");
export const app = (...args) => log(...args, "app");
export const dbg = (...args) => log(...args, "dbg");
export const err = (...args) => log(...args, "err");
export const inf = (...args) => log(...args, "inf");
export const wrn = (...args) => log(...args, "wrn");
