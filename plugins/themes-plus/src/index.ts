import { storage } from "@vendetta/plugin";
import patcher from "./stuff/patcher";
import { showConfirmationAlert } from "@vendetta/ui/alerts";
import { url } from "@vendetta/metro/common";

let patches;
export default {
  onLoad: () => {
    patches = patcher();
    if (!storage.firstInstall) {
      storage.firstInstall = true;
      showConfirmationAlert({
        title: "About Themes+",
        content:
          "Themes+ is a plugin that adds more customizability to themes, such as recoloring icons.",
        confirmText: "More Info",
        confirmColor: "brand" as ButtonColors,
        onConfirm: () =>
          url.openURL("https://github.com/Gabe616/VendettaThemesPlus/#info"),
        cancelText: "Close",
      });
    }
  },
  onUnload: () => patches?.(),
};
