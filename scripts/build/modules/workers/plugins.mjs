import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { extname, join } from "node:path";
import { parentPort } from "node:worker_threads";

import commonjs from "@rollup/plugin-commonjs";
import nodeResolve from "@rollup/plugin-node-resolve";
import { transform } from "@swc/core";
import { format } from "prettier";
import { rollup } from "rollup";
import esbuild from "rollup-plugin-esbuild";
import tsConfigPaths from "rollup-plugin-tsconfig-paths";

import {
    isDev,
    makeMdNote,
    markdownPrettierOptions,
} from "../../lib/common.mjs";

const mdNote = makeMdNote("scripts/build/modules/workers/plugins.ts", "md");

/**
 * @param {string} plugin
 * @param {string | null} lang
 */
async function buildPlugin(plugin, lang) {
    /** @type {import("../../types").Readmes.Manifest} */
    const manifest = JSON.parse(
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

    let langDefault;
    let langValues;

    if (lang) {
        const langDefaultFile = join("lang/values/base", `${lang}.json`);
        if (existsSync(langDefaultFile))
            langDefault = JSON.parse(await readFile(langDefaultFile, "utf8"));

        const langValuesFile = join("lang/values", `${lang}.json`);
        if (existsSync(langValuesFile))
            langValues = JSON.parse(await readFile(langValuesFile, "utf8"));
    }

    const bundle = await rollup({
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
                    const parsers = {
                        text: ["html", "css", "svg"],
                        raw: ["json"],
                        uri: ["png"],
                    };
                    const extToMime = {
                        png: "image/png",
                    };

                    const ext = extname(id).slice(1);
                    const mode = Object.entries(parsers).find(([_, v]) =>
                        v.includes(ext),
                    )?.[0];
                    if (!mode) return null;

                    let thing = null;
                    if (mode === "text") thing = JSON.stringify(code);
                    else if (mode === "raw") thing = code;
                    else if (mode === "uri")
                        thing = JSON.stringify(
                            `data:${extToMime[ext] ?? ""};base64,${(await readFile(id)).toString("base64")}`,
                        );

                    if (thing) return { code: `export default ${thing}` };
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
        compact: true,
        exports: "named",
    });
    await bundle.close();

    const hash = createHash("sha256")
        .update(await readFile(join("dist", plugin, "index.js"), "utf8"))
        .digest("hex");

    const outManifest = manifest;
    outManifest.hash = hash;
    outManifest.main = "index.js";
    await writeFile(
        join("dist", plugin, "manifest.json"),
        JSON.stringify(outManifest),
    );

    return manifest.name;
}

parentPort.postMessage("ready");

if (parentPort)
    parentPort.addListener("message", data =>
        buildPlugin(data.data?.name ?? data.name, data.data?.lang ?? data.lang)
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
