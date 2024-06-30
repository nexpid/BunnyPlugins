import { findByStoreName } from "@vendetta/metro";

import { zustand } from "$/deps";
import { fluxSubscribe } from "$/types";

import { SavedUserData, UserData } from "../types";

const UserStore = findByStoreName("UserStore");

interface CacheState {
  data: SavedUserData | null;
  dir: Record<string, SavedUserData>;
  init: () => void;
  updateData: (data: SavedUserData) => void;
  hasData: () => boolean;
}

export const useCacheStore = zustand.create<CacheState>((set, get) => ({
  data: null,
  dir: {},
  init: () => set({ data: get().dir[UserStore.getCurrentUser()?.id] ?? null }),
  updateData: (data: SavedUserData | null) =>
    set({
      data,
      dir: { ...get().dir, [UserStore.getCurrentUser()?.id]: data },
    }),
  hasData: () => !!get().data,
}));

export function fillData(data: UserData): SavedUserData {
  return {
    ...data,
    at: new Date().toUTCString(),
  };
}

export const unsubCacheStore = fluxSubscribe("CONNECTION_OPEN", () =>
  useCacheStore.getState().init(),
);
