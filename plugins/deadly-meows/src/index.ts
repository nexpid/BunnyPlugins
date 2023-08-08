import { plugin } from "@vendetta";
import { storage } from "@vendetta/plugin";
import { removePlugin, stopPlugin } from "@vendetta/plugins";
import patcher from "./stuff/patcher";
import { showConfirmationAlert } from "@vendetta/ui/alerts";
import settings from "./components/Settings";

export const vstorage: {
  installProgress?: boolean;
  explodeTime?: number;
  punishment?: "mute" | "crash" | "logout";
} = storage;
export const explodeTime = 5000;
export const isMeow = {
  active: false,
  cooldown: 0,
  muted: 0,
};

let unpatch;
export default {
  onLoad: () => {
    if (vstorage.installProgress === undefined) {
      vstorage.installProgress = false;
      setImmediate(() => {
        stopPlugin(plugin.id, true);
      });
    } else if (vstorage.installProgress === false)
      showConfirmationAlert({
        title: "Warning",
        content:
          "This plugin can mute you in all channels, crash your discord and log you out. By pressing Okay you acknowledge this (disabling this plugin will stop this behaviour)",
        confirmText: "Okay",
        confirmColor: "brand" as ButtonColors,
        onConfirm: () => {
          vstorage.installProgress = true;
          unpatch = patcher();
        },
        cancelText: "Cancel",
        //@ts-ignore not in typings
        onCancel: () => removePlugin(plugin.id),
      });
    else if (vstorage.installProgress) unpatch = patcher();
  },
  onUnload: () => unpatch?.(),
  settings,
};
