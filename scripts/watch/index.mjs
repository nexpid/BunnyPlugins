import { createHash, randomUUID } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import { cpus } from "node:os";
import { extname, join, resolve } from "node:path";
import { Worker } from "node:worker_threads";

import chokidar from "chokidar";
import pc from "picocolors";

import { isDev } from "../build/lib/common.mjs";
import rejuvenatePlugins, {
    shouldRejuvenate,
} from "../build/lib/rejuvenate.mjs";
import { fixPluginLangs, makeLangDefs } from "../build/modules/lang.mjs";
import {
    buildPlugin,
    listPlugins,
    restartBuild,
    workerResolves,
    workers,
} from "../build/modules/plugins.mjs";
import {
    writePluginReadmes,
    writeRootReadme,
} from "../build/modules/readmes.mjs";
import getDependencies, {
    allExtensions,
    dependencyMap,
    hashMap,
} from "./lib/getImports.mjs";
import { logBuild, logBuildErr, logDebug, logWatch } from "./lib/print.mjs";

logWatch("Booting up Workers");

await (() =>
    new Promise(res => {
        let count = 0;
        for (let i = 0; i < cpus().length; i++)
            workers.push(
                new Worker(
                    join(
                        import.meta.dirname,
                        "../build/modules/workers/plugins.mjs",
                    ),
                    { workerData: { isDev } },
                ).once("message", () => ++count >= workers.length && res()),
            );
    }))();

logWatch("Parsing imports...");

/** @type {Promise[]} */
const promises = [];

for (const file of await readdir("src", {
    withFileTypes: true,
    recursive: true,
})) {
    if (file.isFile() && allExtensions.includes(extname(file.name)))
        promises.push(getDependencies(resolve(join(file.path, file.name))));
}

await Promise.all(promises);

// meow

const srcPath = resolve("src");

/** @param {string} file */
const runFileChange = async localPath => {
    const file = resolve(localPath);
    const newHash = createHash("sha256")
        .update(await readFile(file, "utf8"))
        .digest("hex");
    if (hashMap.get(file) === newHash) return;

    logWatch(`File changed  ${pc.italic(pc.gray(localPath))}`);
    await getDependencies(file);

    /** @type {Set<string>} */
    const affectedPlugins = new Set();
    /** @type {Set<string>} */
    const checked = new Set();

    /** @param {Set<string>} deps */
    const goThroughDeps = deps => {
        for (const dep of deps) {
            if (checked.has(dep)) continue;
            checked.add(dep);

            const [folder, plugin] = dep
                .slice(srcPath.length + 1)
                .split(/[\\/]/g);
            if (folder === "plugins") affectedPlugins.add(plugin);

            if (dependencyMap.has(dep)) goThroughDeps(dependencyMap.get(dep));
        }
    };

    const [_folder, _plugin] = file.slice(srcPath.length + 1).split(/[\\/]/g);
    if (_folder === "plugins") affectedPlugins.add(_plugin);

    if (dependencyMap.has(file)) goThroughDeps(dependencyMap.get(file));

    const affected = [...affectedPlugins.values()];
    if (affected.length) {
        if (workerResolves.code !== "") logBuild("Aborted build!");
        restartBuild();

        const code = randomUUID();
        workerResolves.code = code;

        try {
            logBuild(
                `Rebuilding ${pc.bold(`${affected.length} plugin${affected.length !== 1 ? "s" : ""}`)}`,
            );

            const rejuvenate = await rejuvenatePlugins(affected);

            const plugins = (await listPlugins()).filter(plugin =>
                affected.includes(plugin.name),
            );

            await fixPluginLangs(affected);
            await makeLangDefs();

            const promise1 = Promise.all([
                writePluginReadmes(affected),
                writeRootReadme(),
            ]);
            for (const plugin of plugins) buildPlugin(plugin, true);

            await (() =>
                new Promise((res, rej) => {
                    workerResolves.res = res;
                    workerResolves.rej = rej;
                }))();
            await promise1;

            if (workerResolves.code === code) {
                await rejuvenate();

                logBuild("Finished building");
                workerResolves.code = "";
            }
        } catch (e) {
            logBuildErr(
                `Failed while building!\n${pc.reset(
                    (e instanceof Error ? e : new Error(e)).stack
                        .split("\n")
                        .map(x => `  ${x}`)
                        .join("\n"),
                )}`,
            );
        }
    }
};

if (!shouldRejuvenate())
    logDebug(`Rejuvenate is not running. Please run "pnpm serve"`);

chokidar
    .watch(["src/**/*.*"], {
        persistent: true,
        ignoreInitial: true,
    })
    .on("add", runFileChange)
    .on("change", runFileChange)
    .on("unlink", runFileChange)
    .on("ready", () => logWatch("Ready!"));
