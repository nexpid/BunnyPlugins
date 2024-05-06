import { existsSync } from "fs";
import { readdir, readFile, writeFile } from "fs/promises";
import { join } from "path";
import { format } from "prettier";

import { parseVariableRules } from "../stuff/crowdin.mjs";

const is = (arr, ...values) =>
  values.every((x) => arr.includes(x)) && arr.length === values.length;

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
          for (const lang of Object.keys(vals)) {
            for (const langKey of Object.keys(vals[lang]).filter(
              (langKey) => !(langKey in dt),
            )) {
              changed = true;
              delete vals[lang][langKey];
            }

            for (const dtKey of Object.keys(dt).filter((dtKey) =>
              lang === "en"
                ? vals[lang][dtKey] !== dt[dtKey]
                : !(dtKey in vals[lang]),
            )) {
              changed = true;
              vals[lang][dtKey] = dt[dtKey];
            }
          }

          if (changed)
            await writeFile(join(fillPath, file), JSON.stringify(vals));
        }
      }

      if (changed) console.log(`Updated values/${file}`);
    }

    const rules = {};

    for (const key of Object.keys(dt)) {
      const rul = parseVariableRules(dt[key]).map((x) => {
        let opt = ["string"];
        if (x.replacers) {
          const rep = Object.keys(x.replacers);
          if (
            (x.kind === "select" && is(rep, "true", "false")) ||
            is(rep, "true", "false", "other")
          )
            opt = ["boolean"];
          else if (x.kind === "select") opt = rep.map((x) => JSON.stringify(x));
          else if (x.kind === "plural") opt = ["number"];
        }

        return [x.variable, opt];
      });
      if (rul.length > 0) rules[key] = rul;
    }

    defs.push(`  ${plugin}: {`);
    defs.push(`    values: typeof import("./values/base/${plugin}.json");`);
    if (Object.entries(rules).length > 0) {
      defs.push("    fillers: {");
      for (const [key, stuff] of Object.entries(rules)) {
        defs.push(
          `      ${JSON.stringify(key)}: { ${stuff.map(([variable, opt]) => `${JSON.stringify(variable)}: ${opt.join(" | ")};`).join(" ")} };`,
        );
      }
      defs.push("    };");
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
