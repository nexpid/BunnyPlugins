import { storage } from "@vendetta/plugin";
import { DBSave } from "./types/api/latest";
import Settings from "./components/Settings";
import { getSaveData, syncSaveData } from "./stuff/api";
import { after } from "@vendetta/patcher";
import { grabEverything } from "./stuff/syncStuff";
import venPlugins from "@vendetta/plugins";
import venThemes from "@vendetta/themes";
import venStorage from "@vendetta/storage";
import { showConfirmationAlert } from "@vendetta/ui/alerts";
import { FluxDispatcher } from "@vendetta/metro/common";
import { hsync } from "./stuff/http";
import patcher from "./stuff/patcher";

export const vstorage: {
  authorization?: string;
  autoSync?: boolean;
  addToSettings?: boolean;
  pluginSettings?: Record<
    string,
    {
      syncPlugin: boolean;
      syncStorage: boolean;
    }
  >;
} = storage;

export const cache: {
  save?: DBSave.Save;
} = {};
export let cacheUpd: (() => void)[] = [];
export function cacheUpdated() {
  cacheUpd.forEach((x) => x());
}
export async function fillCache() {
  try {
    cache.save = await getSaveData();
  } catch {}
  cacheUpdated();
}

vstorage.autoSync ??= false;
vstorage.addToSettings ??= true;
vstorage.pluginSettings ??= {};

let patches = [];
const autoSync = async () => {
  if (!vstorage.autoSync) return;

  const everything = await grabEverything();
  if (JSON.stringify(cache.save) !== JSON.stringify(everything)) {
    hsync(async () => {
      cache.save = await syncSaveData(everything);
      cacheUpdated();
    });
  }
};

export async function promptOrRun(
  shouldPrompt: boolean,
  title: string,
  text: (string | React.JSX.Element) | (string | React.JSX.Element)[],
  callback?: () => Promise<void>
): Promise<void> {
  if (shouldPrompt)
    return new Promise((res) => {
      showConfirmationAlert({
        title: title,
        content: text,
        confirmText: "Yes",
        cancelText: "No",
        confirmColor: "green" as ButtonColors,
        isDismissable: false,
        onConfirm: () => callback?.().then(res),
      });
    });
  else return await callback?.();
}

const patchMMKV = () => {
  patches.push(
    after("createMMKVBackend", venStorage, (_, x) => {
      patches.push(after("set", x, () => autoSync()));
    })
  );
};

let i18nLoaded = false;
let pluginLoaded = false;
FluxDispatcher.subscribe("I18N_LOAD_SUCCESS", () => {
  i18nLoaded = true;
  if (pluginLoaded) patchMMKV();
});

export default {
  onLoad: () => {
    pluginLoaded = true;
    if (vstorage.authorization) fillCache();

    ["installPlugin", "startPlugin", "stopPlugin", "removePlugin"].forEach(
      (x) => patches.push(after(x, venPlugins, () => autoSync()))
    );
    ["installTheme", "selectTheme", "removeTheme"].forEach((x) =>
      patches.push(after(x, venThemes, () => autoSync()))
    );

    if (i18nLoaded) patchMMKV();

    patches.push(patcher());
  },
  onUnload: () => {
    pluginLoaded = false;
    patches.forEach((x) => x());
  },
  settings: Settings,
};
