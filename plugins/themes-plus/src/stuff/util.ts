import { logger } from "@vendetta";
import { findByStoreName } from "@vendetta/metro";
import {
  Flux,
  FluxDispatcher,
  ReactNative as RN,
} from "@vendetta/metro/common";

const ThemeStore = findByStoreName("ThemeStore");
const UnsyncedUserSettingsStore = findByStoreName("UnsyncedUserSettingsStore");

export function flattenStyle(x: any) {
  return RN.StyleSheet.flatten(x) ?? {};
}
export function addToStyle(x: any, y: any) {
  x.style = Object.assign(flattenStyle(x.style), y);
}

export function reloadUI() {
  try {
    const theme = String(ThemeStore.theme);

    // FluxDispatcher.dispatch({
    //   type: "UPDATE_MOBILE_PENDING_THEME_INDEX",
    //   mobileThemesIndex: theme === "dark" ? 1 : 0,
    // });
    // FluxDispatcher.dispatch({
    //   type: "DRAWER_SELECT_TAB",
    //   tab: "CHAT",
    // });
  } catch (e) {
    console.log(e);
    logger.error(e);
  }
}
