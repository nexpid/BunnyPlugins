import { readFile, writeFile } from "fs/promises";

const path = "plugins/nexxutils/src/modules/index.ts";

const file = await readFile(path, "utf8");

const lines = file.split("\n");
const startLine = lines.findIndex((x) => x.startsWith("// hook")) + 2;
if (startLine === 1) throw new Error("failed to find hook :(");

await writeFile(
  path,
  [
    ...lines.slice(0, startLine),
    ...lines.slice(startLine, -2).sort(),
    ...lines.slice(-2),
  ].join("\n"),
);

console.log("Done");
