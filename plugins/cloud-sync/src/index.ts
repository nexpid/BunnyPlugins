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
import { PROXY_PREFIX } from "@vendetta/constants";

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
  databaseMigrate?: number;
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

export async function promptOrRun(
  shouldPrompt: boolean,
  title: string,
  text: (string | React.JSX.Element) | (string | React.JSX.Element)[],
  confirmText: string,
  cancelText: string,
  callback?: () => Promise<any>,
  cancelled?: () => Promise<any>
): Promise<void> {
  if (shouldPrompt)
    return new Promise((res) => {
      showConfirmationAlert({
        title: title,
        content: text,
        confirmText: confirmText,
        cancelText: cancelText,
        confirmColor: "green" as ButtonColors,
        isDismissable: false,
        onConfirm: () => (callback ? callback().then(res) : res()),
        //@ts-ignore
        onCancel: () => (cancelled ? cancelled().then(res) : res()),
      });
    });
  else return await callback?.();
}

export function isPluginProxied(id: string) {
  return id.startsWith(PROXY_PREFIX);
}

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

let patches = [];
let i18nLoaded = false;
let pluginLoaded = false;
const patchMMKV = () => {
  patches.push(
    after("createMMKVBackend", venStorage, (_, x) => {
      patches.push(after("set", x, () => autoSync()));
    })
  );
};

export const currentMigrationStage: number = 2;

vstorage.autoSync ??= false;
vstorage.addToSettings ??= true;
vstorage.pluginSettings ??= {};

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

    const showMsg = (title: string, content: string) =>
      showConfirmationAlert({
        title,
        content,
        onConfirm: () => {},
        confirmText: "Dismiss",
        confirmColor: "brand" as ButtonColors,
        secondaryConfirmText: "Don't show again",
        onConfirmSecondary: () =>
          (vstorage.databaseMigrate = currentMigrationStage),
      });

    if (
      vstorage.databaseMigrate !== currentMigrationStage &&
      window.CSmigrationStage !== currentMigrationStage
    ) {
      window.CSmigrationStage = currentMigrationStage;
      if (currentMigrationStage === 1)
        showMsg(
          "Cloud Sync — DB Migration Stage 1",
          "Hey, I'd like to quickly announce that CloudSync will be switching databases soon and your data may get ***deleted***. Make sure to keep an eye on your data for the upcoming weeks!\n\n- nexx"
        );
      else if (currentMigrationStage === 2)
        showMsg(
          "Cloud Sync — DB Migration Stage 2",
          "CloudSync has officially switched to an SQLite database! (Cloudflare's D1) Make sure to sync your data again in case any was lost while migrating.\n\n- nexx"
        );
    }
  },
  onUnload: () => {
    pluginLoaded = false;
    patches.forEach((x) => x());
  },
  settings: Settings,
};
