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

export async function saveCache(key: string, cache: import("rollup").RollupCache) {
    if (!existsSync(cacheDir)) await mkdir(cacheDir, { recursive: true });

    await writeFile(join(cacheDir, `${key}.cache`), serialize(cache));
}

export async function readCache(key: string): Promise<import("rollup").RollupCache | undefined> {
    const location = join(cacheDir, `${key}.cache`);
    if (!existsSync(location)) return;

    try {
        return deserialize(await readFile(location, "utf8"));
    } catch {
        return;
    }
}
