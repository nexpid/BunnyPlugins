import { findByStoreName } from "@vendetta/metro";
import { createJSONStorage, persist } from "zustand/middleware";

import { RNMMKVManager, zustand } from "$/deps";
import { fluxSubscribe } from "$/types";

import { UserData } from "../types";

const UserStore = findByStoreName("UserStore");

interface CacheState {
    data: UserData | undefined;
    at: string | undefined;
    dir: Record<string, { data: UserData; at: string }>;
    init: () => void;
    updateData: (data?: UserData, at?: string) => void;
    hasData: () => boolean;
}

export const useCacheStore = zustand.create<
    CacheState,
    [["zustand/persist", { dir: CacheState["dir"] }]]
>(
    persist(
        (set, get) => ({
            data: undefined,
            at: undefined,
            dir: {},
            init() {
                const dt = get().dir[UserStore.getCurrentUser()?.id];
                set({ data: dt?.data, at: dt?.at });
            },
            updateData(data, at) {
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
        }),
        {
            name: "cloudsync-cache",
            storage: createJSONStorage(() => RNMMKVManager),
            partialize: state => ({ dir: state.dir }),
            onRehydrateStorage: () => state => state?.init(),
        },
    ),
);

export const unsubCacheStore = fluxSubscribe("CONNECTION_OPEN", () => {
    useCacheStore.persist.rehydrate();
});
