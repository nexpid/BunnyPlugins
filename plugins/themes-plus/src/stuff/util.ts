import { logger } from "@vendetta";
import { findByProps, findByStoreName } from "@vendetta/metro";
import { FluxDispatcher, ReactNative as RN } from "@vendetta/metro/common";

const { setAMOLEDThemeEnabled } = findByProps("setAMOLEDThemeEnabled");
const I18nLoaderStore = findByStoreName("I18nLoaderStore");

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
export async function queueReloadUI() {
  if (I18nLoaderStore.isLoading())
    clearInterval(
      await (() =>
        new Promise((res) => {
          const int = setInterval(
            () =>
              !I18nLoaderStore.isLoading() &&
              (clearInterval(int), setTimeout(res, 2000)),
            10
          );
        }))()
    );

  reloadUI();
}
