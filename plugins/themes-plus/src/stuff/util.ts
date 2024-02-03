import { logger } from "@vendetta";
import { findByProps } from "@vendetta/metro";
import { ReactNative as RN } from "@vendetta/metro/common";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { showToast } from "@vendetta/ui/toasts";

import { lang } from "..";

export function flattenStyle(x: any) {
  return RN.StyleSheet.flatten(x) ?? {};
}
export function addToStyle(x: any, y: any) {
  x.style = Object.assign(flattenStyle(x.style), y);
}

export function reloadUI() {
  try {
    const { setAMOLEDThemeEnabled } = findByProps("setAMOLEDThemeEnabled");
    const { useAMOLEDTheme } = findByProps("useAMOLEDTheme");

    const state = useAMOLEDTheme === 2;
    setAMOLEDThemeEnabled(!state);
    setAMOLEDThemeEnabled(state);
  } catch (e) {
    const log = lang.format("log.init_error", {});
    console.error(`[${lang.format("plugin.name", {})}] ${log}`);
    logger.error(`${log}\n${e.stack}`);

    showToast(lang.format("toast.init_error", {}), getAssetIDByName("Small"));
  }
}

export function queueReloadUI() {
  // i give up
  if (window.TPfirstLoad) reloadUI();
  window.TPfirstLoad = true;
}
