import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { dirname, extname, join, resolve } from "node:path";

import { logDebug } from "../../common/live/print.ts";

export function slashResolve(path: string) {
    return resolve(path).replace(/\\/g, "/");
}
export function slashJoin(...paths: string[]) {
    return join(...paths).replace(/\\/g, "/");
}

export const dependencyMap: Map<string, Set<string>> = new Map();
export const hashMap: Map<string, string> = new Map();

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

const foundFiles: Map<string, string | undefined> = new Map();

function findFile(path: string) {
    if (foundFiles.has(path)) return foundFiles.get(path);

    const res = allExtensions
        .map(ext => (existsSync(path + ext) ? path + ext : false))
        .find(x => typeof x === "string");
    foundFiles.set(path, res);

    return res;
}

const stuffDir = slashResolve("src/stuff");

export default async function getDependencies(file: string) {
    if (!allExtensions.includes(extname(file))) return;

    const dir = dirname(file);

    const content = await readFile(file, "utf8");
    hashMap.set(file, createHash("sha256").update(content).digest("hex"));

    const rawMatches = content.matchAll(/import .*? from "(.*?)"/gs);
    for (const match of rawMatches) {
        const module = match[1];

        let dep: string | undefined;
        let willWarn = false;

        if (module.match(/^\.\.?\//))
            (dep = findFile(slashJoin(dir, module))), (willWarn = true);
        else if (module.startsWith("$/"))
            (dep = findFile(slashJoin(stuffDir, module.slice(2)))),
                (willWarn = true);

        if (dep) {
            if (!dependencyMap.has(dep)) dependencyMap.set(dep, new Set());
            dependencyMap.get(dep)!.add(file);
        } else if (willWarn && !dep) {
            logDebug(
                `Couldn't find dep "${module}" from ${JSON.stringify(file)}`,
            );
        }
    }
}
