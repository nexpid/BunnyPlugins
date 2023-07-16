import { storage } from "@vendetta/plugin";
import settings from "./components/Settings";
import { showConfirmationAlert } from "@vendetta/ui/alerts";
import { createFileBackend } from "@vendetta/storage";

export const vstorage: {
  colors?: {
    neutral1: string;
    neutral2: string;
    accent1: string;
    accent2: string;
    accent3: string;
  };
  lightmode?: boolean;
} = storage;

export const patchesURL =
  "https://raw.githubusercontent.com/Gabe616/VendettaMonetTheme/master/patches.jsonc";
export const devPatchesURL = "http://192.168.2.22:8730/patches.jsonc";
export const commitsURL =
  "https://api.github.com/repos/Gabe616/VendettaMonetTheme/commits?path=patches.jsonc";

const { BundleUpdaterManager } = window.nativeModuleProxy;

export default {
  settings,
  onUnload: () => {
    if (window.__vendetta_theme?.id.includes("monet-theme"))
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
