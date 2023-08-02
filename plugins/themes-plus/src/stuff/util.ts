import { ReactNative as RN } from "@vendetta/metro/common";

export function addToStyle(x: any, y: any) {
  x.style = Object.assign(RN.StyleSheet.flatten(x.style) ?? {}, y);
}

export function reloadUI() {
  // const og = UnsyncedUserSettingsStore.useAMOLEDTheme;
  // FluxDispatcher.dispatch({
  //   type: "UNSYNCED_USER_SETTINGS_UPDATE",
  //   settings: { useAMOLEDTheme: [0, 1, 2].find((x) => x !== og) },
  // });
  // FluxDispatcher.dispatch({
  //   type: "UNSYNCED_USER_SETTINGS_UPDATE",
  //   settings: { useAMOLEDTheme: og },
  // });
}
