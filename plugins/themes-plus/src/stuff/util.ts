import { findByStoreName } from "@vendetta/metro";
import { FluxDispatcher, ReactNative as RN } from "@vendetta/metro/common";

const SelectivelySyncedUserSettingsStore = findByStoreName(
  "SelectivelySyncedUserSettingsStore"
);

export function addToStyle(x: any, y: any) {
  x.style = Object.assign(RN.StyleSheet.flatten(x.style) ?? {}, y);
}

export function reloadUI() {
  const theme =
    SelectivelySyncedUserSettingsStore.getAppearanceSettings().theme.slice();
  const callback = () => {
    SelectivelySyncedUserSettingsStore.removeChangeListener(callback);
    FluxDispatcher.dispatch({
      type: "SELECTIVELY_SYNCED_USER_SETTINGS_UPDATE",
      changes: {
        appearance: { settings: { theme } },
      },
    });
  };
  SelectivelySyncedUserSettingsStore.addChangeListener(callback);

  FluxDispatcher.dispatch({
    type: "SELECTIVELY_SYNCED_USER_SETTINGS_UPDATE",
    changes: {
      appearance: {
        settings: { theme: theme === "light" ? "dark" : "light" },
      },
    },
  });
}
