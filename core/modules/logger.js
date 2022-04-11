import chalk from "chalk";
import moment from "moment";

export const log = (content, type = "log") => {
    const z = moment().format("Z");
    const tz = !z.includes(":30") ? z.replace(/0|:/g, "") : z;
    const timestamp = `${moment().format("YYYY-MM-DD HH:mm:ss")} ${z === "+00:00" ? "UTC" : `UTC${tz}`} |`;

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
