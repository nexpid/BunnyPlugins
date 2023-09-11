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
import { findByProps } from "@vendetta/metro";
import { React } from "@vendetta/metro/common";
import Updating from "./components/Updating";
import { unpatch } from "./stuff/livePreview";

export function migrateStorage() {
  vstorage.config ??= {
    style: vstorage.lightmode ? "light" : "dark",
    wallpaper: vstorage.wallpaper ?? "null",
  };
  vstorage.config.style ??= vstorage.lightmode ? "light" : "dark";
  vstorage.config.wallpaper ??= vstorage.wallpaper ?? "null";
  if (vstorage.lightmode) delete vstorage.lightmode;
  if (vstorage.wallpaper) delete vstorage.wallpaper;
}

export const vstorage: {
  colors?: {
    neutral1: string;
    neutral2: string;
    accent1: string;
    accent2: string;
    accent3: string;
  };
  config?: {
    style: "dark" | "light" | "amoled";
    wallpaper: string | null;
  };
  autoReapply?: boolean;
  /** @deprecated */
  lightmode?: boolean;
  /** @deprecated */
  wallpaper?: string;
  applyCache?: string;
} = storage;

export const patchesURL =
  "https://raw.githubusercontent.com/nexpid/VendettaMonetTheme/main/patches.jsonc";
export const devPatchesURL = "http://192.168.2.22:8730/patches.jsonc";
export const commitsURL =
  "https://api.github.com/repos/nexpid/VendettaMonetTheme/commits?path=patches.jsonc";

const getSysColors = () =>
  window[window.__vendetta_loader?.features?.syscolors?.prop] as
    | VendettaSysColors
    | null
    | undefined;
const hasTheme = () => window.__vendetta_theme?.id.includes("monet-theme");

const makeApplyCache = (syscolors: VendettaSysColors | null | undefined) =>
  !syscolors
    ? JSON.stringify(null)
    : JSON.stringify([
        syscolors.neutral1[7],
        syscolors.neutral2[7],
        syscolors.accent1[7],
        syscolors.accent2[7],
        syscolors.accent3[7],
      ]);

const { BundleUpdaterManager } = window.nativeModuleProxy;
const Alerts = findByProps("openLazy", "close");

export const patches = [];

export default {
  settings,
  onLoad: async () => {
    const syscolors = getSysColors();
    const made = makeApplyCache(syscolors);

    patches.push(() => unpatch?.());

    if (
      vstorage.autoReapply &&
      hasTheme() &&
      syscolors &&
      vstorage.applyCache &&
      made !== vstorage.applyCache
    ) {
      showCustomAlert(() => React.createElement(Updating, {}), {});
      vstorage.applyCache = made;
      setColorsFromDynamic(syscolors);

      let patches;
      try {
        patches = parse(
          (
            await (
              await fetch(patchesURL, {
                cache: "no-store",
              })
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
    } else vstorage.applyCache = made;
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
