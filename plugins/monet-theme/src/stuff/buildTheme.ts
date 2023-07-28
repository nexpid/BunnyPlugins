import { rawColors } from "@vendetta/ui";
import { PatchThing, Patches } from "../types";
import { getLABShade, parseColor } from "./colors";
import { vstorage } from "..";
import { ThemeDataWithPlus } from "../../../../stuff/typings";

export function build(patches: Patches): ThemeDataWithPlus {
  const theme: ThemeDataWithPlus = {
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

  const get = <T extends PatchThing<any>>(lk: T): T["both"] =>
    Object.assign(lk.both, vstorage.lightmode ? lk.light : lk.dark);
  const entries = <T extends {}>(obj: T): [string, T[keyof T]][] =>
    Object.entries(obj);

  const checkShouldPut = (shade: number, checks: string[]): boolean => {
    let shouldPut = true;
    for (const c of checks) {
      if (!shouldPut) break;
      if (c.startsWith(">=")) shouldPut = shade >= Number(c.slice(2));
      else if (c.startsWith("<=")) shouldPut = shade <= Number(c.slice(2));
      else if (c.startsWith(">")) shouldPut = shade > Number(c.slice(1));
      else if (c.startsWith("<")) shouldPut = shade < Number(c.slice(1));
    }

    return shouldPut;
  };

  if (patches.version === 2)
    for (const [x, y] of entries(get(patches.replacers))) {
      let clr = parseColor(y[0]);
      if (!clr) continue;

      for (const c of Object.keys(rawColors).filter((l) =>
        l.startsWith(`${x.split("_")[0]}_`)
      )) {
        const shade = Number(c.split("_")[1]);
        if (!checkShouldPut(shade, x.split("_").slice(1))) continue;

        const mult = y[1];
        theme.rawColors[c] = getLABShade(clr, shade, mult);
      }
    }
  else if (patches.version === 3)
    for (const [x, y] of entries(get(patches.replacers))) {
      const clr = parseColor(y.color);
      if (!clr) continue;

      for (const c of Object.keys(rawColors).filter((l) =>
        l.startsWith(`${x.split("_")[0]}_`)
      )) {
        const shade = Number(c.split("_")[1]);
        if (!checkShouldPut(shade, x.split("_").slice(1))) continue;

        theme.rawColors[c] = getLABShade(
          clr,
          y.base ? shade + (500 - y.base) : shade,
          y.ratio
        );
      }
    }

  for (const [x, y] of entries(get(patches.raw)))
    theme.rawColors[x] = parseColor(y);

  for (const [x, y] of Object.entries(patches.semantic.both))
    theme.semanticColors[x] = [parseColor(y), parseColor(y)];
  for (const [x, y] of Object.entries(patches.semantic.dark)) {
    if (theme.semanticColors[x]) theme.semanticColors[x][0] = parseColor(y);
    else theme.semanticColors[x] = [parseColor(y)];
  }
  for (const [x, y] of Object.entries(patches.semantic.light)) {
    if (theme.semanticColors[x]) theme.semanticColors[x][1] = parseColor(y);
    else theme.semanticColors[x] = [undefined, parseColor(y)];
  }

  if (vstorage.wallpaper)
    theme.background = {
      url: vstorage.wallpaper,
      alpha: 1,
      blur: 2,
    };

  if (patches.version === 3 && patches.plus) {
    theme.plus = {
      version: 0,
      customOverlays: true,
      unreadBadgeColor: parseColor(
        "both" in patches.plus.unreadBadgeColor
          ? patches.plus.unreadBadgeColor.both
          : patches.plus.unreadBadgeColor[vstorage.lightmode ? "light" : "dark"]
      ),
      icons: {},
    };

    for (const [x, y] of entries(get(patches.plus.icons)))
      theme.plus.icons[x] = parseColor(y);
  }

  return JSON.parse(JSON.stringify(theme));
}
