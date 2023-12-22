import { findByProps, findByStoreName } from "@vendetta/metro";
import { React } from "@vendetta/metro/common";
import { id } from "@vendetta/plugin";
import { createFileBackend } from "@vendetta/storage";
import { showConfirmationAlert, showCustomAlert } from "@vendetta/ui/alerts";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { showToast } from "@vendetta/ui/toasts";

import { makeStorage } from "../../../stuff/storage";
import { BundleUpdaterManager } from "../../../stuff/types";
import { VendettaSysColors } from "../../../stuff/typings";
import settings, { setColorsFromDynamic } from "./components/Settings";
import Updating from "./components/Updating";
import { build } from "./stuff/buildTheme";
import { transform } from "./stuff/colors";
import { parse } from "./stuff/jsoncParser";
import { unpatch } from "./stuff/livePreview";

const ThemeStore = findByStoreName("ThemeStore");

export const patchesURL = () =>
  `https://raw.githubusercontent.com/nexpid/VendettaMonetTheme/${
    vstorage.patches.commit ?? "main"
  }/patches.jsonc`;
export const devPatchesURL = "http://192.168.2.22:8730/patches.jsonc";
export const commitsURL =
  "https://api.github.com/repos/nexpid/VendettaMonetTheme/commits?path=patches.jsonc";

export const getSysColors = () =>
  window[window.__vendetta_loader?.features?.syscolors?.prop] as
    | VendettaSysColors
    | null
    | undefined;
const hasTheme = () => window.__vendetta_theme?.id.includes("monet-theme");

export const makeApplyCache = (
  syscolors: VendettaSysColors | null | undefined,
) =>
  JSON.stringify(
    syscolors
      ? [
          syscolors.neutral1[7],
          syscolors.neutral2[7],
          syscolors.accent1[7],
          syscolors.accent2[7],
          syscolors.accent3[7],
        ]
      : null,
  );
export const makeThemeApplyCache = () =>
  JSON.stringify(vstorage.config.style === "auto" ? ThemeStore.theme : null);

const initSyscolors = window[
  window.__vendetta_loader?.features?.syscolors?.prop
] as VendettaSysColors | null | undefined;
export const vstorage = makeStorage({
  colors: {
    neutral1: transform(initSyscolors?.neutral1[7] ?? "#747679"),
    neutral2: transform(initSyscolors?.neutral2[7] ?? "#70777C"),
    accent1: transform(initSyscolors?.accent1[7] ?? "#007FAC"),
    accent2: transform(initSyscolors?.accent2[7] ?? "#657985"),
    accent3: transform(initSyscolors?.accent3[7] ?? "#787296"),
  },
  config: {
    style: "auto" as "dark" | "light" | "auto",
    wallpaper: "none" as string | "none",
  },
  autoReapply: false,
  applyCache: makeApplyCache(initSyscolors),
  themeApplyCache: null,
  patches: {
    from: "git",
    commit: undefined as string | undefined,
  },
});

const Alerts = findByProps("openLazy", "close");

export const patches = [];

export default {
  settings,
  onLoad: async () => {
    const syscolors = getSysColors();
    const made = makeApplyCache(syscolors);
    const themeMade = makeThemeApplyCache();

    patches.push(() => unpatch?.());

    if (
      (vstorage.autoReapply &&
        hasTheme() &&
        syscolors &&
        vstorage.applyCache &&
        made !== vstorage.applyCache) ||
      (vstorage.themeApplyCache && themeMade !== vstorage.themeApplyCache)
    ) {
      showCustomAlert(() => React.createElement(Updating, {}), {});
      vstorage.applyCache = made;
      vstorage.themeApplyCache = themeMade;
      setColorsFromDynamic(syscolors);

      let patches;
      try {
        patches = parse(
          (
            await (
              await fetch(
                vstorage.patches.from === "local"
                  ? devPatchesURL
                  : patchesURL(),
                {
                  cache: "no-store",
                },
              )
            ).text()
          ).replace(/\r/g, ""),
        );
      } catch {
        Alerts.close();
        return showToast(
          "Failed to parse patches.json",
          getAssetIDByName("Small"),
        );
      }

      let theme;
      try {
        theme = build(patches);
      } catch (e) {
        Alerts.close();
        return showToast(e.toString(), getAssetIDByName("Small"));
      }

      await createFileBackend("vendetta_theme.json").set({
        id,
        selected: true,
        data: theme,
      } as Theme);
      BundleUpdaterManager.reload();
    } else {
      vstorage.applyCache = made;
      vstorage.themeApplyCache = themeMade;
    }
  },
  onUnload: () => {
    patches.forEach((x) => x());
    if (hasTheme())
      showConfirmationAlert({
        title: "Unload Theme",
        content:
          "Monet theme is currently selected, would you like to unload it?",
        onConfirm: async () => {
          await createFileBackend("vendetta_theme.json").set({} as Theme);
          BundleUpdaterManager.reload();
        },
        confirmText: "Unload",
        confirmColor: "brand" as ButtonColors,
        cancelText: "Cancel",
      });
  },
};
