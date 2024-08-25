<<<<<<<< HEAD:scripts/build/lib/print.ts
import pc from "picocolors";

export const highlight = pc.yellow;

export const logDebug = (message: string) => console.log(pc.gray(message));
export const logHeader = (name: string) => console.log(`\n${pc.bold(pc.green(name))}`);
export const logCompleted = (time: number) =>
    console.log(pc.cyan(`\nCompleted in ${pc.bold(`${time}ms`)}`));
export const logFinished = (scope: string, time: number) =>
    console.log(pc.magenta(` Finished ${scope} in ${pc.bold(`${time}ms`)}`));


export const logScopeFinished = (scope: string, time: number) =>
    console.log(`  ${scope} ${pc.italic(pc.gray(`${time}ms`))}`);
export const logScopeFailed = (scope: string) =>
    console.log(`\n${pc.red(`${pc.bold("FAILED!")} During:`)} ${scope}`);

export function bench() {
    let start = performance.now();

    return {
        stop: () => {
            const started = start;
            start = performance.now();

            return Math.floor(performance.now() - started);
        },
    };
}

export async function runTask(scope: string, promise: Promise<any>, delay?: boolean) {
    const task = bench();

    let finish = () => void 0;
    await promise
        .then(() => {
            finish = () => {
                logScopeFinished(scope, task.stop());
            };
        })
        .catch(err => {
            finish = () => {
                logScopeFailed(scope);
                throw err instanceof Error
                    ? err
                    : new Error(
                          err?.message ?? err?.toString?.() ?? String(err),
                      );
            };
        });

    return delay ? finish : finish();
}
========
import pc from "picocolors";

export const highlight = pc.yellow;

/** @param {string} message */
export const logDebug = message => console.log(pc.gray(message));
/** @param {string} name */
export const logHeader = name => console.log(`\n${pc.bold(pc.green(name))}`);
/** @param {number} time */
export const logCompleted = time =>
    console.log(pc.cyan(`\nCompleted in ${pc.bold(`${time}ms`)}`));
/**
 * @param {string} scope
 * @param {number} time
 */
export const logFinished = (scope, time) =>
    console.log(pc.magenta(` Finished ${scope} in ${pc.bold(`${time}ms`)}`));

/**
 * @param {string} scope
 * @param {number} time
 */
export const logScopeFinished = (scope, time) =>
    console.log(`  ${scope} ${pc.italic(pc.gray(`${time}ms`))}`);
/** @param {string} scope */
export const logScopeFailed = scope =>
    console.log(`\n${pc.red(`${pc.bold("FAILED!")} During:`)} ${scope}`);

export function bench() {
    let start = performance.now();

    return {
        stop: () => {
            const started = start;
            start = performance.now();

            return Math.floor(performance.now() - started);
        },
    };
}

/**
 *
 * @param {string} scope
 * @param {Promise<any>} promise
 * @param {boolean=} delay
 */
export async function runTask(scope, promise, delay) {
    const task = bench();

    let finish = () => void 0;
    await promise
        .then(() => {
            finish = () => {
                logScopeFinished(scope, task.stop());
            };
        })
        .catch(err => {
            finish = () => {
                logScopeFailed(scope);
                throw err instanceof Error
                    ? err
                    : new Error(
                          err?.message ?? err?.toString?.() ?? String(err),
                      );
            };
        });

    return delay ? finish : finish();
}
>>>>>>>> feat/improve-workspace:scripts/common/statistics/print.mjs
