import pc from "picocolors";

function rn() {
    const date = new Date();

    return `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}:${date.getSeconds().toString().padStart(2, "0")}`;
}

export const highlight = pc.yellow;

/** @param {string} message */
export const logServer = message =>
    console.log(
        `${pc.bold(pc.cyan(`${rn()} [SERVER]`))} ${pc.cyanBright(message)}`,
    );

/** @param {string} message */
export const logWss = message =>
    console.log(
        `${pc.bold(pc.yellow(`${rn()} [WSS]`))} ${pc.yellowBright(message)}`,
    );

/** @param {string} message */
export const logDebug = message =>
    console.log(pc.gray(`${pc.bold(pc.gray(`${rn()} [DEBUG]`))} ${message}`));

/** @param {string} message */
export const logWatch = message =>
    console.log(
        `${pc.bold(pc.magenta(`${rn()} [WATCH]`))} ${pc.magentaBright(message)}`,
    );

/** @param {string} message */
export const logBuild = message =>
    console.log(
        `${pc.bold(pc.cyan(`${rn()} [BUILD]`))} ${pc.cyanBright(message)}`,
    );

/** @param {string} message */
export const logBuildErr = message =>
    console.log(
        `${pc.bold(pc.red(`${rn()} [BUILD] ERR!`))} ${pc.redBright(message)}`,
    );
