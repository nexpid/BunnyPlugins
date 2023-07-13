import { rawColors } from "@vendetta/ui";
import { Patches } from "../components/Settings";
import { getLABShade, parseColor } from "./colors";

export function build(patches: Patches) {
  const theme = {
    name: "Material You Theme 1.0.43",
    description: "A Discord theme with Material You theming.",
    authors: [
      {
        name: "nexpid",
        id: "853550207039832084",
      },
      {
        name: "Taki_Shiwa",
        id: "466968658997149706",
      },
    ],
    semanticColors: {},
    rawColors: {},
    spec: 2,
  };

  for (const [x, y] of Object.entries(patches.replacers)) {
    const clr = parseColor(y[0]);
    if (!clr) continue;

    for (const c of Object.keys(rawColors).filter((l) =>
      l.startsWith(`${x.split("_")[0]}_`)
    )) {
      const shade = Number(c.split("_")[1]);

      let shouldPut = true;
      for (const c of x.split("_").slice(1)) {
        if (!shouldPut) break;
        if (c.startsWith(">=")) shouldPut = shade >= Number(c.slice(2));
        else if (c.startsWith("<=")) shouldPut = shade <= Number(c.slice(2));
        else if (c.startsWith(">")) shouldPut = shade > Number(c.slice(1));
        else if (c.startsWith("<")) shouldPut = shade < Number(c.slice(1));
      }
      if (!shouldPut) continue;

      const mult = y[1];
      theme.rawColors[c] = getLABShade(clr, shade, mult);
    }
  }
  for (const [x, y] of Object.entries(patches.semantic))
    theme.semanticColors[x] = [parseColor(y)];
  for (const [x, y] of Object.entries(patches.raw))
    theme.rawColors[x] = parseColor(y);

  console.log(JSON.stringify(theme));
  return JSON.parse(JSON.stringify(theme)); // guh
}
