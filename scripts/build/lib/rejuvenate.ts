import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const serveCachePath = "node_modules/.serve/";

export function shouldRejuvenate() {
    return existsSync(join(serveCachePath, "update"));
}

/** @param {string[]} plugins */
export default async function rejuvenatePlugins(plugins) {
    /** @type {Record<string, string>} */
    const oldManifests = {};
    for (const plugin of plugins)
        try {
            oldManifests[plugin] = await readFile(
                join("dist", plugin, "manifest.json"),
                "utf8",
            );
        } catch {
            // meow
        }

    return async () => {
        /** @type {Record<string, string>} */
        const newManifests = {};
        for (const plugin of plugins)
            try {
                newManifests[plugin] = await readFile(
                    join("dist", plugin, "manifest.json"),
                    "utf8",
                );
            } catch {
                // meow
            }

        /** @type {Array<string>} */
        const changes = [];

        for (const plugin of Object.keys(newManifests))
            if (newManifests[plugin] !== oldManifests[plugin])
                changes.push(plugin);

        if (shouldRejuvenate())
            await writeFile(
                join(serveCachePath, "update"),
                changes.join("\u0000"),
            );
    };
}
