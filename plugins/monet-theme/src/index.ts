import { storage } from "@vendetta/plugin";
import settings, { setColorsFromDynamic } from "./components/Settings";
import { showConfirmationAlert, showCustomAlert } from "@vendetta/ui/alerts";
import { createFileBackend } from "@vendetta/storage";
import { VendettaSysColors } from "../../../stuff/typings";
import { build } from "./stuff/buildTheme";
import { showToast } from "@vendetta/ui/toasts";
import { parse } from "./stuff/jsoncParser";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { id } from "@vendetta/plugin";
import { findByProps, findByStoreName } from "@vendetta/metro";
import { React } from "@vendetta/metro/common";
import Updating from "./components/Updating";
import { unpatch } from "./stuff/livePreview";
import { BundleUpdaterManager } from "../../../stuff/types";

const ThemeStore = findByStoreName("ThemeStore");

export const vstorage: {
  colors?: {
    neutral1: string;
    neutral2: string;
    accent1: string;
    accent2: string;
    accent3: string;
  };
  config?: {
    style: "dark" | "light" | "auto";
    wallpaper: string | "none";
  };
  autoReapply?: boolean;
  applyCache?: string;
  themeApplyCache?: string;
  patches?: {
    from: "local" | "git";
    commit?: string;
  };
  /** @deprecated */
  localPatches?: boolean;
} = storage;

export const patchesURL = () =>
  `https://raw.githubusercontent.com/nexpid/VendettaMonetTheme/${
    vstorage.patches?.commit ?? "main"
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
  syscolors: VendettaSysColors | null | undefined
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
      : null
  );
export const makeThemeApplyCache = () =>
  JSON.stringify(vstorage.config.style === "auto" ? ThemeStore.theme : null);

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
                vstorage.patches?.from === "local"
                  ? devPatchesURL
                  : patchesURL(),
                {
                  cache: "no-store",
                }
              )
            ).text()
          ).replace(/\r/g, "")
        );
      } catch {
        Alerts.close();
        return showToast(
          "Failed to parse patches.json",
          getAssetIDByName("Small")
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
