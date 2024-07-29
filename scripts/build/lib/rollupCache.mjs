import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const cacheDir = join("node_modules/rollup/.cache");

const serialize = data =>
    JSON.stringify(data, (_, val) =>
        typeof val === "bigint" ? `BigInt${val.toString()}BigInt` : val,
    );
const deserialize = data =>
    JSON.parse(data, (_, val) =>
        typeof val === "string" &&
        val.startsWith("BigInt") &&
        val.endsWith("BigInt")
            ? BigInt(val.slice(6, -6))
            : val,
    );

/**
 * @param {string} key
 * @param {import("rollup").RollupCache} cache
 */
export async function saveCache(key, cache) {
    if (!existsSync(cacheDir)) await mkdir(cacheDir, { recursive: true });

    await writeFile(join(cacheDir, `${key}.cache`), serialize(cache));
}

/**
 * @param {string} key
 * @returns {Promise<import("rollup").RollupCache=>}
 */
export async function readCache(key) {
    const location = join(cacheDir, `${key}.cache`);
    if (!existsSync(location)) return;

    try {
        return deserialize(await readFile(location, "utf8"));
    } catch {
        return;
    }
}
