import { createHash, randomUUID } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import { cpus } from "node:os";
import { extname, join } from "node:path";

import chokidar from "chokidar";
import pc from "picocolors";

import { isDev } from "../build/lib/common.ts";
import rejuvenatePlugins, {
    shouldRejuvenate,
} from "../build/lib/rejuvenate.ts";
import { fixPluginLangs, makeLangDefs } from "../build/modules/lang.ts";
import {
    buildPlugin,
    listPlugins,
    restartBuild,
    workerResolves,
    workers,
} from "../build/modules/plugins.ts";
import {
    writePluginReadmes,
    writeRootReadme,
} from "../build/modules/readmes.ts";
import {
    logBuild,
    logBuildErr,
    logDebug,
    logWatch,
    logWatchErr,
} from "../common/live/print.ts";
import { TsWorker } from "../common/worker/index.ts";
import getDependencies, {
    allExtensions,
    dependencyMap,
    hashMap,
    slashResolve,
} from "./lib/getImports.ts";

const makeErrorGoodLooking = (e: any) =>
    pc.reset(
        String((e instanceof Error ? e : new Error(e)).stack)
            .split("\n")
            .map(x => `  ${x}`)
            .join("\n"),
    );

logWatch("Booting up Workers");

await (() =>
    new Promise<void>(res => {
        let count = 0;
        for (let i = 0; i < cpus().length; i++)
            workers.push(
                new TsWorker(
                    join(
                        import.meta.dirname,
                        "../build/modules/workers/plugins.ts",
                    ),
                    { workerData: { isDev } },
                ).once("message", () => ++count >= workers.length && res()),
            );
    }))();

logWatch("Parsing imports...");

const promises: Promise<void>[] = [];

for (const file of await readdir("src", {
    withFileTypes: true,
    recursive: true,
})) {
    if (file.isFile() && allExtensions.includes(extname(file.name)))
        promises.push(
            getDependencies(
                slashResolve(join(file.path, file.name)).replace(/\\/g, "/"),
            ),
        );
}

await Promise.all(promises);

// meow

const srcPath = slashResolve("src") + "/";
const langPath = slashResolve("lang") + "/";

const runFileChange = async (localPath: string) => {
    const file = slashResolve(localPath);
    const newHash = createHash("sha256")
        .update(await readFile(file, "utf8"))
        .digest("hex");
    if (hashMap.get(file) === newHash) return;

    const affectedPlugins: Set<string> = new Set();

    logWatch(`File changed  ${pc.italic(pc.gray(localPath))}`);

    if (file.slice(langPath.length).startsWith("values/base/")) {
        const [_, __, langFile] = file.slice(langPath.length).split("/");

        affectedPlugins.add(
            langFile.split(".").slice(0, -1).join(".").replace(/_/g, "-"),
        );
    } else {
        await getDependencies(file);

        const checked: Set<string> = new Set();

        const goThroughDeps = (deps: Set<string>) => {
            for (const dep of deps) {
                if (checked.has(dep)) continue;
                checked.add(dep);

                const [folder, plugin] = dep.slice(srcPath.length).split("/");
                if (folder === "plugins") affectedPlugins.add(plugin);

                if (dependencyMap.has(dep))
                    goThroughDeps(dependencyMap.get(dep)!);
            }
        };

        const [_folder, _plugin] = file.slice(srcPath.length).split("/");
        if (_folder === "plugins") affectedPlugins.add(_plugin);

        if (dependencyMap.has(file)) goThroughDeps(dependencyMap.get(file)!);
    }

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
            const promise = Promise.all([
                makeLangDefs(),
                writePluginReadmes(affected),
                writeRootReadme(),
                new Promise<void>((res, rej) => {
                    workerResolves.res = res as any;
                    workerResolves.rej = rej as any;
                }),
            ]);

            for (const plugin of plugins) buildPlugin(plugin, true);
            await promise;

            if (workerResolves.code === code) {
                await rejuvenate();

                logBuild("Finished building");
                workerResolves.code = "";
            }
        } catch (e: any) {
            logBuildErr(`Failed while building!\n${makeErrorGoodLooking(e)}`);
        }
    }
};

if (!shouldRejuvenate())
    logDebug(`Rejuvenate is not running. Please run "pnpm serve"`);

chokidar
    .watch(["src/**/*.*", "lang/values/base/*.json"], {
        persistent: true,
        ignoreInitial: true,
    })
    .on("add", path =>
        runFileChange(path).catch(e =>
            logWatchErr(
                `Failed during runFileChange (${path})!\n${makeErrorGoodLooking(e)}`,
            ),
        ),
    )
    .on("change", path =>
        runFileChange(path).catch(e =>
            logWatchErr(
                `Failed during runFileChange (${path})!\n${makeErrorGoodLooking(e)}`,
            ),
        ),
    )
    .on("ready", () => logWatch("Ready!"));

process.on("uncaughtException", () => {});
process.on("unhandledRejection", () => {});
