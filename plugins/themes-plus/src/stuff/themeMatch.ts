import { findByStoreName } from "@vendetta/metro";
import { FluxDispatcher } from "@vendetta/metro/common";

const UnsyncedUserSettingsStore = findByStoreName("UnsyncedUserSettingsStore");

export function matchTheme(colors: {
  dark?: string;
  light?: string;
  amoled?: string;
  darker?: string;
}): string | undefined {
  const theme = UnsyncedUserSettingsStore.useAMOLEDTheme;

  if (theme === 3) return colors.darker ?? colors.dark;
  else if (theme === 2) return colors.amoled ?? colors.dark;
  else if (theme === 1) return colors.light;
  else if (theme === 0) return colors.dark;
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
