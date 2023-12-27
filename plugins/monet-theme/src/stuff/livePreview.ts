import { findByProps } from "@vendetta/metro";
import { chroma } from "@vendetta/metro/common";
import { instead } from "@vendetta/patcher";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { showToast } from "@vendetta/ui/toasts";

import { ThemeDataWithPlus } from "../../../../stuff/typings";
import { stsPatches } from "../components/Settings";
import { build } from "./buildTheme";

// TODO keep up to date with https://github.com/vendetta-mod/Vendetta/blob/rewrite/src/lib/themes.ts

const color = findByProps("SemanticColor");

const semanticAlternativeMap: Record<string, string> = {
  BG_BACKDROP: "BACKGROUND_FLOATING",
  BG_BASE_PRIMARY: "BACKGROUND_PRIMARY",
  BG_BASE_SECONDARY: "BACKGROUND_SECONDARY",
  BG_BASE_TERTIARY: "BACKGROUND_SECONDARY_ALT",
  BG_MOD_FAINT: "BACKGROUND_MODIFIER_ACCENT",
  BG_MOD_STRONG: "BACKGROUND_MODIFIER_ACCENT",
  BG_MOD_SUBTLE: "BACKGROUND_MODIFIER_ACCENT",
  BG_SURFACE_OVERLAY: "BACKGROUND_FLOATING",
  BG_SURFACE_OVERLAY_TMP: "BACKGROUND_FLOATING",
  BG_SURFACE_RAISED: "BACKGROUND_MOBILE_PRIMARY",
};

const extractInfo = (themeMode: string, colorObj: any): [string, any] => {
  const propName =
    // @ts-expect-error - assigning to extractInfo._sym
    colorObj[(extractInfo._sym ??= Object.getOwnPropertySymbols(colorObj)[0])];
  const colorDef = color.SemanticColor[propName];

  return [propName, colorDef[themeMode.toLowerCase()]];
};

const overwrite = (theme: ThemeDataWithPlus) => {
  const patches = new Array<() => void>();
  let enabled = true;
  patches.push(() => (enabled = false));

  const oldRaw = color.default.unsafe_rawColors;

  color.default.unsafe_rawColors = new Proxy(oldRaw, {
    get: (_, colorProp: string) => {
      if (!enabled) return Reflect.get(oldRaw, colorProp);

      return theme.rawColors?.[colorProp] ?? Reflect.get(oldRaw, colorProp);
    },
  });

  instead(
    "resolveSemanticColor",
    color.default.meta ?? color.default.internal,
    (args, orig) => {
      if (!enabled) return orig(...args);

      const [theme, propIndex] = args;
      const [name, colorDef] = extractInfo(theme, propIndex);

      const themeIndex = theme === "amoled" ? 2 : theme === "light" ? 1 : 0;

      //! As of 192.7, Tabs v2 uses BG_ semantic colors instead of BACKGROUND_ ones
      const alternativeName = semanticAlternativeMap[name] ?? name;

      const semanticColorVal = (theme.semanticColors?.[name] ??
        theme.semanticColors?.[alternativeName])?.[themeIndex];
      if (
        name === "CHAT_BACKGROUND" &&
        typeof theme.background?.alpha === "number"
      ) {
        return chroma(semanticColorVal || "black")
          .alpha(1 - theme.background.alpha)
          .hex();
      }

      if (semanticColorVal) return semanticColorVal;

      const rawValue = theme.rawColors?.[colorDef.raw];
      if (rawValue) {
        // Set opacity if needed
        return colorDef.opacity === 1
          ? rawValue
          : chroma(rawValue).alpha(colorDef.opacity).hex();
      }

      // Fallback to default
      return orig(...args);
    },
  );

  return () => patches.forEach((x) => x());
};

export let unpatch: () => void;
export let enabled = false;

export function toggle(val: boolean) {
  if (enabled === val) return;

  unpatch?.();
  enabled = val;
  showToast(
    `Live theme preview ${enabled ? "enabled" : "disabled"}`,
    getAssetIDByName("ic_info"),
  );

  if (val) unpatch = overwrite(build(stsPatches));
  else unpatch = undefined;
}
