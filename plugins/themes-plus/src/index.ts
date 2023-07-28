import { storage } from "@vendetta/plugin";
import patcher from "./stuff/patcher";
import { showConfirmationAlert } from "@vendetta/ui/alerts";
import { url } from "@vendetta/metro/common";
import Settings from "./components/Settings";

export enum PatchType {
  Icons,
  UnreadBadgeColor,
  CustomIconOverlays,
  MentionLineColor,
}
export const patchTypeReadable = Object.fromEntries([
  [PatchType.Icons, "Custom icon colors"],
  [PatchType.UnreadBadgeColor, "Unread badge color"],
  [PatchType.CustomIconOverlays, "Custom icon overlays"],
  [PatchType.MentionLineColor, "Mention line color"],
]);

export let active: {
  active: boolean;
  patches: PatchType[];
} = {
  active: false,
  patches: [],
};

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
  settings: Settings,
};
