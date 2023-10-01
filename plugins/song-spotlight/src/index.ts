import { storage } from "@vendetta/plugin";
import { currentAuthorization, getSaveData } from "./stuff/api";
import { API } from "./types/api";
import { createStorage, wrapSync } from "@vendetta/storage";
import patcher from "./stuff/patcher";
import settings from "./components/Settings";

export interface AuthRecord {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}
export const vstorage: {
  host?: string;
  auth?: Record<string, AuthRecord>;
} = storage;

let _cache: any;
export const cache: {
  data?: API.Save;
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
    cache.data = await getSaveData();
  } catch {}
}

let unpatch: () => void;
export default {
  onLoad: () => {
    if (currentAuthorization()) fillCache();
    unpatch = patcher();
  },
  onUnload: () => unpatch?.(),
  settings,
};
