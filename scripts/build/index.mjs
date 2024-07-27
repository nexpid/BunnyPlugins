import { cpus } from "node:os";
import { join } from "node:path";
import { Worker } from "node:worker_threads";

import {
    bench,
    highlight,
    logCompleted,
    logDebug,
    logFinished,
    logHeader,
    runTask,
} from "./lib/print.mjs";
import { fixPluginLangs, makeLangDefs } from "./modules/lang.mjs";
import {
    buildPlugin,
    listPlugins,
    workerResolves,
    workers,
} from "./modules/plugins.mjs";
import { writePluginReadmes, writeRootReadme } from "./modules/readmes.mjs";

logDebug("Waiting for Workers to boot up");

await (() =>
    new Promise(res => {
        let count = 0;
        for (let i = 0; i < cpus().length; i++)
            workers.push(
                new Worker(
                    join(import.meta.dirname, "modules/workers/plugins.mjs"),
                ).once("message", () => ++count >= workers.length && res()),
            );
    }))();

const offset = performance.now();

// Write lang files

const writePluginLangFiles = bench();
logHeader("Writing plugin lang files");

await Promise.all([
    runTask(`Wrote ${highlight("defs.d.ts")} types file`, makeLangDefs()),
    runTask(
        `Fixed ${highlight("plugin translation")} filess`,
        fixPluginLangs(),
    ),
]);

logFinished("writing plugin lang files", writePluginLangFiles.stop());

// Build plugins

const buildingPlugins = bench();
logHeader("Building plugins");

for (const plugin of await listPlugins()) buildPlugin(plugin);

await (() =>
    new Promise((res, rej) => {
        workerResolves.res = res;
        workerResolves.rej = rej;
    }))();

workers.forEach(x => x.terminate());
logFinished("building plugins", buildingPlugins.stop());

// Write READMEs

const writeReadmeFiles = bench();
logHeader("Writing README files");

await Promise.all([
    runTask(`Wrote ${highlight("plugins")} READMEs`, writePluginReadmes()),
    runTask(`Wrote ${highlight("root")} README`, writeRootReadme()),
]);

logFinished("writing README files", writeReadmeFiles.stop());

logCompleted(Math.floor(performance.now() - offset));

// point();
// logHeader("Building plugins");
// for (let i = 0; i < meow.length; i++) {
//     const x = meow[i];

//     await wait(25);
//     logScope(`Built plugin ${pc.yellow(x)}`, point());
//     if ((i + 1) % 4 === 0) await wait(500);
// }
// logFinished("building plugins", Math.floor(Math.random() * 5000));

// logHeader("Writing READMEs");
// logScope(`Wrote ${pc.yellow("root")} README`, Math.floor(Math.random() * 500));
// await wait(1000);
// logScope(
//     `Wrote ${pc.yellow("plugin")} READMEs`,
//     Math.floor(Math.random() * 1000) + 500,
// );
// logFinished("writing READMEs", Math.floor(Math.random() * 2000));

// logHeader("Writing lang files");
// logScope(
//     `Wrote ${pc.yellow("defs.d.ts")} file`,
//     Math.floor(Math.random() * 300),
// );
// await wait(350);
// logScope(
//     `Fixed ${pc.yellow("cloud_sync")}'s lang file`,
//     Math.floor(Math.random() * 200),
// );
// logFinished("writing lang files", Math.floor(Math.random() * 500));

// logCompleted(Math.floor(performance.now()));
