import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

import { format } from "prettier";

import { prettierOptions } from "../lib/common.mjs";
import { listPlugins } from "./plugins.mjs";

const variableRules = [
    // You have {plugins} {plugins, plural, one {plugin} other {plugins}}!
    // Good {time, select, isDay {day} isNight {night} other {}}!
    /{([^}]+), (select|plural), ?\n?([\s\S]+?)(?=(}})|(} ?\r?\n ?}))/g,
    // Hello world from {plugin.name}!
    /{([^}]+)}/g,
];
const replacerRegExp = /(\w+) {([^}]*)} ?/g;

/**
 * @param {string} text
 */
function parseVariablesToRules(text) {
    /** @type {import("../types").Lang.Rule[]} */
    const rules = [];

    for (const regex of variableRules) {
        const matches = text.matchAll(regex);
        for (const rawMatch of Array.from(matches)) {
            const [match, variable, kind, rawReplacers, _suffix, __suffix] =
                rawMatch;
            const { index: start } = rawMatch;

            const suffix = _suffix ?? __suffix ?? "";
            const length = match.length + suffix.length;

            // ignore previous matches
            if (rules.some(x => start >= x.start && start < x.start + x.length))
                continue;

            if (!kind)
                rules.push({
                    type: "variable",
                    variable,
                    start,
                    length,
                });
            else if (kind === "select" || kind === "plural") {
                // map replacers into an object
                const replacers = Object.fromEntries(
                    Array.from(
                        (rawReplacers + "}").matchAll(replacerRegExp),
                    ).map(x => [x[1], x[2]]),
                );
                rules.push({
                    type: "choose",
                    kind,
                    variable,
                    start,
                    length,
                    replacers,
                });
            }
        }
    }

    return rules;
}

export async function fixPluginLangs() {
    for (const { lang: plugin } of await listPlugins()) {
        if (!plugin) continue;

        /** @type {Record<string, Record<string, string>>} */
        const translations = JSON.parse(
            await readFile(join("lang/values", plugin + ".json"), "utf-8"),
        );

        /** @type {Record<string, string>} */
        const base = JSON.parse(
            await readFile(join("lang/values/base", plugin + ".json"), "utf8"),
        );

        for (const entries of Object.values(translations)) {
            for (const key of Object.keys(entries)) {
                if (!base[key]) delete entries[key];
                else if (translations.en[key] !== base[key])
                    entries[key] = base[key];
            }

            for (const key of Object.keys(base))
                if (!entries[key]) entries[key] = base[key];
        }

        // minify but also not really
        await writeFile(
            join("lang/values", plugin + ".json"),
            `{\n${Object.entries(translations)
                .sort((a, b) => a[0].localeCompare(b[0]))
                .map(
                    ([lang, entries]) =>
                        `  ${JSON.stringify(lang)}: ${JSON.stringify(entries)}`,
                )
                .join(",\n")}\n}`,
        );
    }
}

export async function makeLangDefs() {
    /** @type {string[]} */
    const chunks = [];

    // header
    chunks.push("export default interface LangValues {");

    for (const { lang: plugin } of await listPlugins()) {
        if (!plugin) continue;

        // sub-heaer
        chunks.push(`${JSON.stringify(plugin)}: {`);

        chunks.push(
            `values: typeof import(${JSON.stringify(`./values/base/${plugin}.json`)});`,
        );

        const values = JSON.parse(
            await readFile(join("lang/values/base", plugin + ".json"), "utf8"),
        );

        /** @type {Record<string, import("../types").Lang.Rule[]>} */
        const keyRulesMap = {};

        for (const key of Object.keys(values)) {
            const rules = parseVariablesToRules(values[key]);
            if (rules[0]) keyRulesMap[key] = rules;
        }

        if (Object.keys(keyRulesMap)[0]) {
            // sub-sub-header
            chunks.push("fillers: {");

            for (const key of Object.keys(keyRulesMap))
                chunks.push(
                    `${JSON.stringify(key)}: { ${Object.values(keyRulesMap[key])
                        .map(
                            rule =>
                                `${JSON.stringify(rule.variable)}: ${rule.type === "choose" && rule.kind === "plural" ? "number" : "string"}`,
                        )
                        .join(", ")} }`,
                );

            // sub-sub-footer
            chunks.push("};");
        } else chunks.push("fillers: null;");

        // sub-footer
        chunks.push("};");
    }

    // footer
    chunks.push("};");

    await writeFile(
        join("lang", "defs.d.ts"),
        await format(chunks.join("\n"), {
            parser: "babel-ts",
            ...prettierOptions,
        }),
    );
}
