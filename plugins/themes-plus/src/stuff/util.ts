import { logger } from "@vendetta";
import { findByProps } from "@vendetta/metro";
import { ReactNative as RN } from "@vendetta/metro/common";

const { setAMOLEDThemeEnabled } = findByProps("setAMOLEDThemeEnabled");

export function flattenStyle(x: any) {
  return RN.StyleSheet.flatten(x) ?? {};
}
export function addToStyle(x: any, y: any) {
  x.style = Object.assign(flattenStyle(x.style), y);
}

export function reloadUI() {
  try {
    const { useAMOLEDTheme } = findByProps("useAMOLEDTheme");

    const state = useAMOLEDTheme === 2;
    setAMOLEDThemeEnabled(!state);
    setAMOLEDThemeEnabled(state);
  } catch (e) {
    console.log(e);
    logger.error(e);
  }
}
