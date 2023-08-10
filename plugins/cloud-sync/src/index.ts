import { storage } from "@vendetta/plugin";
import { DBSave } from "./types/api/latest";
import Settings from "./components/Settings";
import { currentAuthorization, getSaveData, syncSaveData } from "./stuff/api";
import { before } from "@vendetta/patcher";
import { grabEverything } from "./stuff/syncStuff";
import venPlugins from "@vendetta/plugins";
import venThemes from "@vendetta/themes";
import { hsync } from "./stuff/http";
import patcher from "./stuff/patcher";
import { PROXY_PREFIX } from "@vendetta/constants";

export interface AuthRecord {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}
export const vstorage: {
  autoSync?: boolean;
  addToSettings?: boolean;
  pluginSettings?: Record<
    string,
    {
      syncPlugin: boolean;
      syncStorage: boolean;
    }
  >;
  auth?: Record<string, AuthRecord>;
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

// export const currentMigrationStage: number = 2;

export default {
  onLoad: () => {
    if (currentAuthorization()) fillCache();

    ["installPlugin", "startPlugin", "stopPlugin", "removePlugin"].forEach(
      (x) =>
        patches.push(
          before(x, venPlugins, () => {
            autoSync();
          })
        )
    );
    ["installTheme", "selectTheme", "removeTheme"].forEach((x) =>
      patches.push(
        before(x, venThemes, () => {
          autoSync();
        })
      )
    );
    patches.push(patcher());

    if (storage.databaseMigrate) delete storage.databaseMigrate;

    // const showMsg = (title: string, content: string) =>
    //   showConfirmationAlert({
    //     title,
    //     content,
    //     onConfirm: () => {},
    //     confirmText: "Dismiss",
    //     confirmColor: "brand" as ButtonColors,
    //     secondaryConfirmText: "Don't show again",
    //     onConfirmSecondary: () =>
    //       (vstorage.databaseMigrate = currentMigrationStage),
    //   });
    // if (
    //   vstorage.databaseMigrate !== currentMigrationStage &&
    //   window.CSmigrationStage !== currentMigrationStage
    // ) {
    //   window.CSmigrationStage = currentMigrationStage;
    //   if (currentMigrationStage === 1)
    //     showMsg(
    //       "Cloud Sync — DB Migration Stage 1",
    //       "Hey, I'd like to quickly announce that CloudSync will be switching databases soon and your data may get ***deleted***. Make sure to keep an eye on your data for the upcoming weeks!\n\n- nexx"
    //     );
    //   else if (currentMigrationStage === 2)
    //     showMsg(
    //       "Cloud Sync — DB Migration Stage 2",
    //       "CloudSync has officially switched to an SQLite database! (Cloudflare's D1) Make sure to sync your data again in case any was lost while migrating.\n\n- nexx"
    //     );
    // }
  },
  onUnload: () => patches.forEach((x) => x()),
  settings: Settings,
};
