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

logDebug("Booting up Workers");

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
