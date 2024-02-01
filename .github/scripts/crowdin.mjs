import { readdir, readFile, writeFile } from "fs/promises";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const dir = dirname(fileURLToPath(import.meta.url));

for (const lang of await readdir(".")) {
  if (lang === "base" || lang.endsWith(".json")) continue;

  const data = {};
  for (const file of await readdir(lang))
    data[file.split(".")[0]] = JSON.parse(
      await readFile(join(".", lang, file), "utf8"),
    );

  await writeFile(
    join(dir, "../../stuff/lang/values", lang + ".json"),
    JSON.stringify(data, undefined, 4),
  );
  console.log(`Wrote ${lang}.json`);
}
console.log("Done");
