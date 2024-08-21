import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { dirname, extname, join, resolve } from "node:path";

import { logDebug } from "./print.ts";

/** @type {Map<string, Set<string>>} */
export const dependencyMap = new Map();

/** @type {Map<string, string>} */
export const hashMap = new Map();

const baseExtensions = [".d.ts", ".ts", ".js", ".mjs", ".cjs"];
const jsxExtensions = [
    ...baseExtensions,
    ...baseExtensions.map(ext => ext + "x"),
];
export const allExtensions = [
    ...jsxExtensions,
    ...jsxExtensions.map(ext => `\\index${ext}`),
    "",
];

/** @type {Map<string, string | undefined>} */
const foundFiles = new Map();

/** @param {string | undefined} path */
function findFile(path) {
    if (foundFiles.has(path)) return foundFiles.get(path);

    const res = allExtensions
        .map(ext => (existsSync(path + ext) ? path + ext : false))
        .find(x => typeof x === "string");
    foundFiles.set(path, res);

    return res;
}

const stuffDir = resolve("src/stuff");

/** @param {string} file */
export default async function getDependencies(file) {
    if (!allExtensions.includes(extname(file))) return;

    const dir = dirname(file);

    const content = await readFile(file, "utf8");
    hashMap.set(file, createHash("sha256").update(content).digest("hex"));

    const rawMatches = content.matchAll(/import .*? from "(.*?)"/gs);
    for (const match of rawMatches) {
        const module = match[1];

        /** @type {string} */
        let dep;
        /** @type {boolean} */
        let willWarn;

        if (module.match(/^\.\.?\//))
            (dep = findFile(join(dir, module))), (willWarn = true);
        else if (module.startsWith("$/"))
            (dep = findFile(join(stuffDir, module.slice(2)))),
                (willWarn = true);

        if (dep) {
            if (!dependencyMap.has(dep)) dependencyMap.set(dep, new Set());
            dependencyMap.get(dep).add(file);
        } else if (willWarn && !dep) {
            logDebug(
                `Couldn't find dep "${module}" from ${JSON.stringify(file)}`,
            );
        }
    }
}
