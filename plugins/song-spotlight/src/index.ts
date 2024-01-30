import { createStorage, wrapSync } from "@vendetta/storage";

import { makeStorage } from "$/storage";

import settings from "./components/Settings";
import { currentAuthorization, getSaveData } from "./stuff/api";
import patcher from "./stuff/patcher";
import { API } from "./types/api";

export interface AuthRecord {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export const vstorage = makeStorage({
  host: undefined as string,
  auth: {} as Record<string, AuthRecord>,
});

let _cache: any;
export const cache: {
  data?: API.Save;
} = wrapSync(
  createStorage({
    get: () => _cache,
    set: (x) => {
      _cache = x;
    },
  }),
);

export async function fillCache() {
  try {
    cache.data = await getSaveData();
  } catch {
    return;
  }
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
