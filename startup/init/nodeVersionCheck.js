import chalk from "chalk";
import semver from "semver";
import pkg from "../../package.json";

const { engines: required } = pkg;
    
export default () => {
    const nodeVer = process.version.slice(1);

    if (!semver.satisfies(nodeVer, required["node"])) {
        throw new Error(chalk.red(`Node.js ${required["node"]} required - please update. v16.6 is recommended.`));
    } else {
        console.log(`${chalk.green("✔ Node.js version check passed")} (required: ${chalk.underline.yellow(required["node"])}, current: ${chalk.underline.green(nodeVer)})`);
    }
};
