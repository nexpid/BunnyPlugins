import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, extname, join } from "node:path";
import { promisify } from "node:util";
import { parentPort, workerData } from "node:worker_threads";

import commonjs from "@rollup/plugin-commonjs";
import nodeResolve from "@rollup/plugin-node-resolve";
import { transform } from "@swc/core";
import imageSize from "image-size";
import Mime from "mime";
import { format } from "prettier";
import { rollup } from "rollup";
import esbuild from "rollup-plugin-esbuild";
import tsConfigPaths from "rollup-plugin-tsconfig-paths";

import { makeMdNote, markdownPrettierOptions } from "../../lib/common.ts";
import { saveCache } from "../../lib/rollupCache.ts";

const sizeOf = promisify(imageSize);
const mdNote = makeMdNote("scripts/build/modules/workers/plugins.ts", "md");

const { isDev } = workerData;

async function buildPlugin(
    plugin: string,
    lang: string | null,
    prcess: string,
) {
    const manifest: import("../../types").Readmes.Manifest = JSON.parse(
        await readFile(join("src/plugins", plugin, "manifest.json"), "utf8"),
    );

    const title = `${manifest.name} (by ${manifest.authors
        .map(x => x.name)
        .join(", ")})`;

    await mkdir(join("dist", plugin), { recursive: true });
    await writeFile(
        join("dist", plugin, "index.md"),
        await format(
            [
                "---",
                `title: ${title}`,
                `description: ${manifest.description}`,
                "---\n",

                `${mdNote}\n`,

                // header
                '<div align="center">',
                `<h1>${title}</h1>`,
                `<h3>${manifest.description}</h3>`,
                // footer
                "</div>\n",

                "> **Note**",
                `> This is a landing page for the plugin **${manifest.name}**. The proper way to install this plugin is going to Bunny's Plugins page and adding it there.`,
            ].join("\n"),
            {
                parser: "markdown",
                ...markdownPrettierOptions,
            },
        ),
    );

    let langDefault: object | null = null;
    let langValues: object | null = null;

    if (lang) {
        const langDefaultFile = join("lang/values/base", `${lang}.json`);
        if (existsSync(langDefaultFile))
            langDefault = JSON.parse(await readFile(langDefaultFile, "utf8"));

        const langValuesFile = join("lang/values", `${lang}.json`);
        if (existsSync(langValuesFile))
            langValues = JSON.parse(await readFile(langValuesFile, "utf8"));
    }

    const bundle = await rollup({
        // cache: await readCache(plugin),
        cache: false, // cache was turned off due to caching lang, which we don't want
        input: join("src/plugins", plugin, manifest.main),
        onwarn: () => void 0,
        plugins: [
            tsConfigPaths(),
            nodeResolve(),
            commonjs(),
            {
                name: "swc",
                async transform(code, id) {
                    const ext = extname(id);
                    if (![".ts", ".tsx", ".js", ".jsx"].includes(ext))
                        return null;

                    const ts = ext.includes("ts");
                    const tsx = ts ? ext.endsWith("x") : undefined;
                    const jsx = !ts ? ext.endsWith("x") : undefined;

                    return await transform(code, {
                        filename: id,
                        jsc: {
                            externalHelpers: false,
                            parser: {
                                syntax: ts ? "typescript" : "ecmascript",
                                tsx,
                                jsx,
                            },
                        },
                        env: {
                            targets: "defaults",
                            include: [
                                "transform-classes",
                                "transform-arrow-functions",
                                "transform-class-properties",
                            ],
                        },
                        sourceMaps: true,
                    });
                },
            },
            {
                name: "file-parser",
                async transform(code, id) {
                    const ext = extname(id);

                    if (
                        [
                            ".png",
                            ".jpg",
                            ".jpeg",
                            ".bmp",
                            ".gif",
                            ".webp",
                            ".psd",
                        ].includes(ext)
                    ) {
                        const dimensions = (await sizeOf(id))!;

                        const checkTpConfig = async (
                            root: string,
                        ): Promise<{
                            config: { root: string };
                            location: string;
                        } | null> =>
                            existsSync(join(root, "tpconfig.json"))
                                ? {
                                      config: JSON.parse(
                                          await readFile(
                                              join(root, "tpconfig.json"),
                                              "utf8",
                                          ),
                                      ),
                                      location: root,
                                  }
                                : null;

                        // only support one subfolder
                        const tpConfig =
                            (await checkTpConfig(dirname(id))) ??
                            (await checkTpConfig(dirname(dirname(id))));

                        return {
                            code: `export default ${JSON.stringify({
                                uri: `data:${Mime.getType(id)};base64,${(await readFile(id)).toString("base64")}`,
                                width: dimensions.width,
                                height: dimensions.height,
                                file: tpConfig
                                    ? join(
                                          tpConfig.config.root,
                                          id.slice(
                                              tpConfig.location.length + 1,
                                          ),
                                      ).replace(/\\/g, "/")
                                    : null,
                                allowIconTheming: !!tpConfig,
                            })};`,
                        };
                    } else if (
                        [".html", ".css", ".svg", ".json"].includes(ext)
                    ) {
                        return {
                            code:
                                ext === ".json"
                                    ? `export default ${code};`
                                    : `export default ${JSON.stringify(code)};`,
                        };
                    }
                },
            },
            esbuild({
                minifySyntax: !isDev,
                minifyWhitespace: !isDev,
                define: {
                    IS_DEV: String(isDev),
                    DEFAULT_LANG: langDefault
                        ? JSON.stringify(langDefault)
                        : "undefined",
                    DEV_LANG: langValues
                        ? JSON.stringify(langValues)
                        : "undefined",
                },
            }),
        ],
    });
    await bundle.write({
        file: join("dist", plugin, "index.js"),
        globals(id) {
            if (id.startsWith("@vendetta"))
                return id.substring(1).replace(/\//g, ".");
            const map = {
                react: "window.React",
            };

            return map[id] || null;
        },
        format: "iife",
        compact: !isDev,
        exports: "named",
    });
    await bundle.close();

    const hash = createHash("sha256")
        .update(await readFile(join("dist", plugin, "index.js"), "utf8"))
        .digest("hex");

    const outManifest = manifest;
    outManifest.hash = hash;
    outManifest.main = "index.js";

    finishUp.set(prcess, () => {
        finishUp.delete(prcess);

        writeFile(
            join("dist", plugin, "manifest.json"),
            JSON.stringify(outManifest),
        );
    });

    if (bundle.cache) await saveCache(plugin, bundle.cache);
    return manifest.name;
}

const finishUp = new Map<string, () => void>();

if (parentPort) parentPort.postMessage("ready");
else throw new Error("why is parentPort missing???");

if (parentPort)
    parentPort.addListener("message", data =>
        data.finishUp
            ? finishUp.get(data.finishUp)?.()
            : buildPlugin(data.name, data.lang, data.prcess)
                  .then(
                      plugin =>
                          parentPort &&
                          parentPort.postMessage({
                              result: "yay",
                              plugin,
                          }),
                  )
                  .catch(
                      err =>
                          parentPort &&
                          parentPort.postMessage({
                              result: "nay",
                              err:
                                  err instanceof Error
                                      ? err
                                      : new Error(
                                            err?.message ??
                                                err?.toString?.() ??
                                                String(err),
                                        ),
                          }),
                  ),
    );
