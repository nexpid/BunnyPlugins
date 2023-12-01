import { storage } from "@vendetta/plugin";
import { DBSave } from "./types/api/latest";
import Settings from "./components/Settings";
import { currentAuthorization, getSaveData, syncSaveData } from "./stuff/api";
import { grabEverything } from "./stuff/syncStuff";
import { plugins } from "@vendetta/plugins";
import { hsync } from "./stuff/http";
import patcher from "./stuff/patcher";
import { PROXY_PREFIX } from "@vendetta/constants";
import { themes } from "@vendetta/themes";
import { createStorage, wrapSync } from "@vendetta/storage";

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
  host?: string;
  clientId?: string;
} = storage;

let _cache: any;
export const cache: {
  save?: DBSave.Save;
} = wrapSync(
  createStorage({
    get: () => _cache,
    set: (x) => {
      _cache = x;
    },
  })
);

export async function fillCache() {
  try {
    cache.save = await getSaveData();
  } catch {}
}

export function isPluginProxied(id: string) {
  return id.startsWith(PROXY_PREFIX);
}
export function canImport(id: string) {
  return !id.includes("cloud-sync");
}

const autoSync = async () => {
  if (!vstorage.autoSync) return;

  const everything = await grabEverything();
  if (JSON.stringify(cache.save) !== JSON.stringify(everything))
    hsync(async () => (cache.save = await syncSaveData(everything)));
};

const emitterSymbol = Symbol.for("vendetta.storage.emitter");
export const emitterAvailable =
  !!(plugins as any)[emitterSymbol] && !!(themes as any)[emitterSymbol];

let patches = [];
export default {
  onLoad: () => {
    if (currentAuthorization()) fillCache();

    if (emitterAvailable) {
      const emitters = {
        plugins: (plugins as any)[emitterSymbol] as Emitter,
        themes: (themes as any)[emitterSymbol] as Emitter,
      };

      emitters.plugins.on("SET", autoSync);
      emitters.themes.on("SET", autoSync);
      emitters.plugins.on("DEL", autoSync);
      emitters.themes.on("DEL", autoSync);

      patches.push(() => {
        emitters.plugins.off("SET", autoSync);
        emitters.themes.off("SET", autoSync);
        emitters.plugins.off("DEL", autoSync);
        emitters.themes.off("DEL", autoSync);
      });
    }

    patches.push(patcher());

    if (storage.databaseMigrate) delete storage.databaseMigrate;
  },
  onUnload: () => patches.forEach((x) => x()),
  settings: Settings,
};
