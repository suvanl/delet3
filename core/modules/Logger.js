const { bgBlue, bgRed, bgYellow, blue, green, grey, yellow } = require("chalk");
const moment = require("moment");

exports.log = (content, type = "log") => {
    const z = moment().format("Z");
    const tz = !z.includes(":30") ? z.replace(/0|:/g, "") : z;
    const timestamp = `${moment().format("YYYY-MM-DD HH:mm:ss")} ${z === "00:00" ? "UTC" : `UTC${tz}`} |`;

    switch (type) {
        case "cmd": {
            return console.log(`${timestamp} ${blue(type.toUpperCase())} » ${content}`);
        }
        case "dbg": {
            return console.log(`${timestamp} ${yellow(type.toUpperCase())} » ${content}`);
        }
        case "err": {
            return console.log(`${timestamp} ${bgRed(type.toUpperCase())} » ${content}`);
        }
        case "inf": {
            return console.log(`${timestamp} ${bgBlue(type.toUpperCase())} » ${content}`);
        }
        case "log": {
            return console.log(`${timestamp} ${grey(type.toUpperCase())} » ${content}`);
        }
        case "rdy": {
            return console.log(`${timestamp} ${green(type.toUpperCase())} » ${content}`);
        }
        case "wrn": {
            return console.log(`${timestamp} ${bgYellow(type.toUpperCase())} » ${content}`);
        }
        default: throw new TypeError("Invalid logger type.");
    }
};

exports.cmd = (...args) => this.log(...args, "cmd");
exports.dbg = (...args) => this.log(...args, "dbg");
exports.err = (...args) => this.log(...args, "err");
exports.inf = (...args) => this.log(...args, "inf");
exports.wrn = (...args) => this.log(...args, "wrn");
