import { existsSync } from "fs";
import { readFile, writeFile, readdir } from "fs/promises";
import { join } from "path";
import { format } from "prettier";

export async function write(path, defsPath, fillPath) {
  /** @type {string[]} */
  const defs = [];
  defs.push("export interface LangValues {");

  for (const file of await readdir(path)) {
    if (!file.endsWith(".json")) continue;
    const plugin = file.split(".")[0];

    let dt;
    try {
      dt = JSON.parse(await readFile(join(path, file)));
    } catch {
      console.log(`Failed to parse values/base/${file}`);
      continue;
    }

    if (fillPath) {
      let changed = false;

      if (!existsSync(join(fillPath, file))) {
        changed = await writeFile(
          join(fillPath, file),
          JSON.stringify({ en: dt }),
        );
      } else {
        let vals;
        try {
          vals = JSON.parse(await readFile(join(fillPath, file)));
        } catch {
          console.log(`Failed to parse values/${file}`);
        }

        if (vals) {
          for (const [lang, dict] of Object.entries(vals)) {
            for (const langKey of Object.keys(dict).filter(
              (langKey) => !(langKey in dt),
            )) {
              changed = true;
              delete dict[langKey];
            }

            for (const dtKey of Object.keys(dt).filter((dtKey) =>
              lang === "en" ? dict[dtKey] !== dt[dtKey] : !(dtKey in dict),
            )) {
              changed = true;
              dict[dtKey] = dt[dtKey];
            }
          }

          if (changed)
            await writeFile(join(fillPath, file), JSON.stringify(vals));
        }
      }

      if (changed) console.log(`Updated values/${file}`);
    }

    const fillers = Object.entries(dt)
      .map((x) => [x[0], x[1].match(/\$\w+/g)?.map((x) => x.slice(1)) ?? []])
      .filter((x) => x[1].length > 0);

    defs.push(`  ${plugin}: {`);
    defs.push(`    values: typeof import("./values/base/${plugin}.json");`);
    if (fillers.length > 0) {
      defs.push("    fillers: {");
      for (const [key, stuff] of fillers)
        defs.push(`      ${JSON.stringify(key)}: ${JSON.stringify(stuff)};`);
      defs.push("    }");
    } else defs.push("    fillers: null;");
    defs.push("  };");
  }

  defs.push("}\n");
  await writeFile(
    defsPath,
    await format(defs.join("\n"), { parser: "typescript" }),
  );
  console.log("Updated defs.d.ts");
}
