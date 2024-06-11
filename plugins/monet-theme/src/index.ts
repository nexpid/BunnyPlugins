import { findByStoreName } from "@vendetta/metro";
import { storage } from "@vendetta/plugin";
import { showConfirmationAlert } from "@vendetta/ui/alerts";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { showToast } from "@vendetta/ui/toasts";
import { safeFetch } from "@vendetta/utils";

import { ThemeDataWithPlus, VendettaSysColors } from "$/typings";

import settings from "./components/Settings";
import { apply, build } from "./stuff/buildTheme";
import { parse } from "./stuff/jsoncParser";
import { Patches } from "./types";

export const patchesURL = () =>
  `https://raw.githubusercontent.com/nexpid/VendettaMonetTheme/${
    vstorage.patches.commit ?? "main"
  }/patches.jsonc`;
export const devPatchesURL = "http://192.168.2.22:8730/patches.jsonc";
export const commitsURL =
  "https://api.github.com/repos/nexpid/VendettaMonetTheme/commits?path=patches.jsonc";

const ThemeStore = findByStoreName("ThemeStore");

export const getSysColors = () =>
  (
    window as any
  ).bunny.api.native.loader.getSysColors() as VendettaSysColors | null;
export const hasTheme = () =>
  (window as any).bunny.managers.themes
    .getCurrentTheme()
    ?.id.includes("monet-theme");
export const getDiscordTheme = () => {
  // getDefaultFallbackTheme is not exported :(
  const theme = ThemeStore.theme;

  if (theme.startsWith("vd-theme-")) return theme.split("-")[3];
  else return theme;
};

export const vstorage = storage as {
  colors: {
    neutral1: string;
    neutral2: string;
    accent1: string;
    accent2: string;
    accent3: string;
  };
  config: {
    wallpaper: string | "none";
  };
  autoReapply: boolean;
  reapplyCache: {
    colors?: string;
    theme?: string;
  };
  patches: {
    from: "git" | "local";
    commit?: string;
  };
};

export const patches = [];

export default {
  settings,
  onLoad: async () => {
    const syscolors = getSysColors();

    vstorage.colors ??= {
      neutral1: syscolors?.neutral1[7] ?? "#747679",
      neutral2: syscolors?.neutral2[7] ?? "#70777C",
      accent1: syscolors?.accent1[7] ?? "#007FAC",
      accent2: syscolors?.accent2[7] ?? "#657985",
      accent3: syscolors?.accent3[7] ?? "#787296",
    };
    vstorage.config ??= {
      wallpaper: "none",
    };
    vstorage.autoReapply ??= false;
    vstorage.patches ??= {
      from: "git",
    };

    const oldColors = vstorage.reapplyCache?.colors;
    const oldTheme = vstorage.reapplyCache?.theme;

    let lTheme = getDiscordTheme();
    vstorage.reapplyCache = {
      colors: JSON.stringify(syscolors),
      theme: lTheme,
    };

    const reapply = async () => {
      if (!vstorage.autoReapply || !hasTheme()) return;
      showToast("Reapplying Monet Theme", getAssetIDByName("RetryIcon"));

      let cpatches: Patches;
      try {
        cpatches = parse(
          (
            await (
              await safeFetch(
                vstorage.patches.from === "local"
                  ? devPatchesURL
                  : patchesURL(),
                {
                  headers: { "cache-control": "public, max-age=600" },
                },
              )
            ).text()
          ).replace(/\r/g, ""),
        );
      } catch (e: any) {
        return showToast(
          "Failed to fetch color patches!",
          getAssetIDByName("Small"),
        );
      }

      let theme: ThemeDataWithPlus;
      try {
        theme = build(cpatches);
      } catch (e: any) {
        return showToast("Failed to build theme!", getAssetIDByName("Small"));
      }

      apply(theme);
    };

    if (
      oldTheme &&
      oldColors &&
      syscolors &&
      (vstorage.reapplyCache.colors !== oldColors ||
        vstorage.reapplyCache.theme !== oldTheme)
    )
      reapply();

    const onThemeChanged = () => {
      const newLTheme = getDiscordTheme();
      if (lTheme !== newLTheme) reapply();
      lTheme = newLTheme;
    };

    ThemeStore.addChangeListener(onThemeChanged);
    patches.push(() => ThemeStore.removeChangeListener(onThemeChanged));
  },
  onUnload: () => {
    patches.forEach((x) => x());
    if (hasTheme())
      showConfirmationAlert({
        title: "Deselect Theme",
        content:
          "Monet theme is currently selected, would you like to deselect it?",
        onConfirm: async () => {
          apply(false);
        },
        confirmText: "Unload",
        confirmColor: "brand" as ButtonColors,
        cancelText: "Cancel",
      });
  },
};
