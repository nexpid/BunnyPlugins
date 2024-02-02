import { readdir, readFile, writeFile } from "fs/promises";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const dir = dirname(fileURLToPath(import.meta.url));

const data = {};

for (const lang of await readdir(".")) {
  if (lang === "base" || lang.endsWith(".json")) continue;

  for (const file of await readdir(join(".", lang))) {
    const key = file.split(".")[0];
    data[key] ??= {};
    data[key][lang] = JSON.parse(await readFile(join(".", lang, file), "utf8"));
  }
}

/** @type {string[]} */
const defs = [];
defs.push("export interface LangValues {");

for (const file of await readdir(join(".", "base"))) {
  if (!file.endsWith(".json")) continue;
  const plugin = file.split(".")[0];

  const data = JSON.parse(await readFile(join(".", "base", file)));
  const fillers = Object.entries(data)
    .map((x) => [x[0], x[1].match(/\$\w+/g) ?? []])
    .filter((x) => x[1].length > 0);

  defs.push(`  ${plugin}: {`);
  defs.push(`    values: import("./values/base/${plugin}.json");`);
  if (fillers.length > 0) {
    defs.push("    fillers: {");
    for (const [key, stuff] of fillers)
      defs.push(`      ${JSON.stringify(key)}: ${JSON.stringify(stuff)};`);
    defs.push("    }");
  } else defs.push("    fillers: null;");
  defs.push("  };");
}

for (const [plugin, dt] of Object.entries(data)) {
  await writeFile(
    join(dir, "../stuff/lang/values", plugin + ".json"),
    JSON.stringify(dt),
  );

  console.log(`Wrote ${plugin}.json`);
}

defs.push("}\n");
await writeFile(join(dir, "../stuff/lang/defs.d.ts"), defs.join("\n"));
console.log("Updated defs.d.ts");

console.log("Done");
