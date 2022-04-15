import chalk from "chalk";
import { DateTime } from "luxon";

export const log = (content, category = "log") => {
    const offset = DateTime.now().toFormat("Z");
    const timestamp = `${DateTime.now().toFormat("y-MM-dd HH:mm:ss")} ${offset === "0" ? "" : `UTC${offset}`} |`;

    switch (category) {
        case "cmd": {
            return console.log(`${timestamp} ${chalk.blue(category.toUpperCase())} » ${content}`);
        }
        case "app": {
            return console.log(`${timestamp} ${chalk.magenta(category.toUpperCase())} » ${content}`);
        }
        case "debug": {
            return console.log(`${timestamp} ${chalk.yellow(category.toUpperCase())} » ${content}`);
        }
        case "error": {
            return console.log(`${timestamp} ${chalk.bgRed(category.toUpperCase())} » ${content}`);
        }
        case "info": {
            return console.log(`${timestamp} ${chalk.bgBlue(category.toUpperCase())} » ${content}`);
        }
        case "log": {
            return console.log(`${timestamp} ${chalk.white(category.toUpperCase())} » ${content}`);
        }
        case "ready": {
            return console.log(`${timestamp} ${chalk.green(category.toUpperCase())} » ${content}`);
        }
        case "warn": {
            return console.log(`${timestamp} ${chalk.bgYellow(category.toUpperCase())} » ${content}`);
        }
        default: throw new TypeError("Invalid logger type.");
    }
};

export const cmd = (...args) => log(...args, "cmd");
export const app = (...args) => log(...args, "app");
export const debug = (...args) => log(...args, "debug");
export const error = (...args) => log(...args, "error");
export const info = (...args) => log(...args, "info");
export const warn = (...args) => log(...args, "warn");
