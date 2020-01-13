/*-------------------------------------------------
 * delet³ for Discord
 * Copyright (c) 2020 suvanl. All rights reserved.
 * See License.md in project root for license info.
 *------------------------------------------------*/

// Node.js version check
const { green, red, underline } = require("chalk");

const nodeVer = process.version.slice(1).split(".")[0];
const minVer = "12";
const recVer = "12";

if (nodeVer < 12) throw new Error(red(`Node.js ${minVer} or higher is required - please update. v${recVer} is recommended.`));
else console.log(`Node.js version check ${green("passed")} ✅\nmin: ${red(minVer)} | recommended: ${green(recVer)} | current: ${underline.green(nodeVer)}`);
