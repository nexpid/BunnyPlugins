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

export const getSysColors = () =>
  (
    window as any
  ).bunny.api.native.loader.getSysColors() as VendettaSysColors | null;
export const hasTheme = () =>
  (window as any).bunny.managers.themes
    .getCurrentTheme()
    ?.id.includes("monet-theme");

const ThemeStore = findByStoreName("ThemeStore");

export const vstorage = storage as {
  colors: {
    neutral1: string;
    neutral2: string;
    accent1: string;
    accent2: string;
    accent3: string;
  };
  config: {
    style: "dark" | "light" | "auto";
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
      style: "auto",
      wallpaper: "none",
    };
    vstorage.autoReapply ??= false;
    vstorage.patches ??= {
      from: "git",
    };

    const oldColors = vstorage.reapplyCache.colors;
    const oldTheme = vstorage.reapplyCache.theme;

    vstorage.reapplyCache = {
      colors: JSON.stringify(syscolors),
      theme: JSON.stringify(ThemeStore.theme),
    };

    if (
      !oldTheme ||
      !oldColors ||
      !vstorage.autoReapply ||
      !hasTheme() ||
      !syscolors
    )
      return;

    if (
      vstorage.reapplyCache.colors !== oldColors ||
      vstorage.reapplyCache.theme !== oldTheme
    ) {
      showToast("Monet Theme is reapplying...", getAssetIDByName("RetryIcon"));

      let patches: Patches;
      try {
        patches = parse(
          (
            await (
              await safeFetch(
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
      } catch (e: any) {
        return showToast(
          "Failed to fetch color patches!",
          getAssetIDByName("Small"),
        );
      }

      let theme: ThemeDataWithPlus;
      try {
        theme = build(patches);
      } catch (e: any) {
        return showToast("Failed to build theme!", getAssetIDByName("Small"));
      }

      apply(theme);
    }
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
