const { bgBlue, bgRed, bgYellow, blue, green, grey, orange } = require("chalk");
const moment = require("moment");

exports.log = (content, type = "log") => {
    const timestamp = `${moment().format("YYYY-MM-DD HH:mm:ss [GMT]")} |`;

    switch (type) {
        case "cmd": {
            return console.log(`${timestamp} ${blue(type.toUpperCase())} » ${content}`);
        }
        case "dbg": {
            return console.log(`${timestamp} ${orange(type.toUpperCase())} » ${content}`);
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
exports.wrn = (...args) => this.log(...args, "wrn");
