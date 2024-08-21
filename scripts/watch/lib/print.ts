import pc from "picocolors";

function rn() {
    const date = new Date();

    return `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}:${date.getSeconds().toString().padStart(2, "0")}`;
}

export const highlight = pc.yellow;

export const logWatch = (message: string) =>
    console.log(
        `${pc.bold(pc.magenta(`${rn()} [WATCH]`))} ${pc.magentaBright(message)}`,
    );

export const logBuild = (message: string) =>
    console.log(
        `${pc.bold(pc.cyan(`${rn()} [BUILD]`))} ${pc.cyanBright(message)}`,
    );

export const logBuildErr = (message: string) =>
    console.log(
        `${pc.bold(pc.red(`${rn()} [BUILD] ERR!`))} ${pc.redBright(message)}`,
    );

export const logDebug = (message: string) =>
    console.log(pc.gray(`${pc.bold(pc.gray(`${rn()} [DEBUG]`))} ${message}`));
