import { findByStoreName } from "@vendetta/metro";

import { zustand } from "$/deps";
import { fluxSubscribe } from "$/types";

import { UserData } from "../types";

const UserStore = findByStoreName("UserStore");

interface CacheState {
    data: UserData | null;
    at: string | null;
    dir: Record<string, { data: UserData; at: string }>;
    init: () => void;
    updateData: (data: UserData | null, at: string | null) => void;
    hasData: () => boolean;
}

export const useCacheStore = zustand.create<CacheState>((set, get) => ({
    data: null,
    at: null,
    dir: {},
    init: () => {
        const dt = get().dir[UserStore.getCurrentUser()?.id];
        set({ data: dt.data, at: dt.at });
    },
    updateData: (data: UserData | null, at: string | null) => {
        set({
            data,
            at,
            dir: {
                ...get().dir,
                [UserStore.getCurrentUser()?.id]: { data, at },
            },
        });
    },
    hasData: () => !!get().data && !!get().at,
}));

export const unsubCacheStore = fluxSubscribe("CONNECTION_OPEN", () => {
    useCacheStore.getState().init();
});
