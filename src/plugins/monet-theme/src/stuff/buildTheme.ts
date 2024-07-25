import { logger } from "@vendetta";
import { rawColors } from "@vendetta/ui";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { showToast } from "@vendetta/ui/toasts";

import { ThemeDataWithPlus } from "$/typings";

import { getDiscordTheme, vstorage } from "..";
import { Patches, PatchThing } from "../types";
import { getLABShade, parseColor } from "./colors";

export function apply(theme: ThemeDataWithPlus | false) {
    const { bunny } = (window as any);

    const val = theme
        ? {
            id: "monet-theme",
            selected: false,
            data: theme,
        }
        : null;

    try {
        bunny.managers.themes.selectTheme(val);
        bunny.managers.themes.applyTheme(val);

        if (!val) showToast("Cleared theme", getAssetIDByName("TrashIcon"));
        else showToast("Applied theme", getAssetIDByName("PaintPaletteIcon"));
        return true;
    } catch (e: any) {
        showToast("Couldn't apply theme!", getAssetIDByName("Small"));
        logger.error(`Failed to apply theme!\n${e.stack}`);
    }
}

export function build(patches: Patches): ThemeDataWithPlus {
    const theme: ThemeDataWithPlus = {
        name: "Material You Theme 2.0",
        description: "A Bunny theme with Material You theming.",
        authors: [
            {
                name: "nexpid",
                id: "853550207039832084",
            },
        ],
        semanticColors: {},
        rawColors: {},
        spec: 2,
    };

    const style = getDiscordTheme();

    const get = <T extends PatchThing<any>>(lk: T): T["both"] =>
        Object.assign(lk.both, style === "light" ? lk.light : lk.dark);
    const entries = <T extends object>(obj: T): [string, T[keyof T]][] =>
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

    if (patches.version === 3)
        for (const [x, y] of entries(get(patches.replacers))) {
            const clr = parseColor(y.color);
            if (!clr) continue;

            for (const c of Object.keys(rawColors).filter(l =>
                l.startsWith(`${x.split("_")[0]}_`),
            )) {
                const shade = Number(c.split("_")[1]);
                if (!checkShouldPut(shade, x.split("_").slice(1))) continue;

                const useShade = y.alternative
                    ? Math.floor((shade / 26) * 1000)
                    : shade;

                theme.rawColors[c] = getLABShade(
                    clr,
                    y.base ? useShade + (500 - y.base) : useShade,
                    y.ratio,
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

    if (vstorage.config.wallpaper !== "none")
        theme.background = {
            url: vstorage.config.wallpaper,
            alpha: 1,
        };

    if (patches.version === 3 && patches.plus) {
        theme.plus = {
            customOverlays: true,
            version: 0,
            icons: {},
        };

        for (const [x, y] of entries(get(patches.plus.icons)))
            theme.plus.icons[x] = parseColor(y);
    }

    return JSON.parse(JSON.stringify(theme));
}
