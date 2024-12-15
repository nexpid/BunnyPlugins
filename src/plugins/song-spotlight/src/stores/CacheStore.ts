import { findByStoreName } from "@vendetta/metro";
import { createJSONStorage, persist } from "zustand/middleware";

import { RNCacheModule, zustand } from "$/deps";
import { fluxSubscribe } from "$/types";

import { UserData } from "../types";

const UserStore = findByStoreName("UserStore");

interface CacheState {
    data: UserData | undefined;
    at: string | undefined;
    revalidateAt: number | undefined;
    dir: Record<
        string,
        {
            data: UserData | undefined;
            at: string | undefined;
            revalidateAt: number;
            listed?: boolean;
        }
    >;
    init: () => void;
    updateData: (data?: UserData, at?: string, revalidateAt?: number) => void;
    updateDir: (
        user: string,
        data: {
            data: UserData | undefined;
            at: string | undefined;
            revalidateAt: number;
        },
    ) => void;
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
            revalidateAt: undefined,
            dir: {},
            init() {
                const { data, at, revalidateAt } =
                    get().dir[UserStore.getCurrentUser()?.id] ?? {};
                set({ data, at, revalidateAt });
            },
            updateData(data, at, revalidateAt) {
                set({
                    data,
                    at,
                    revalidateAt,
                    dir: {
                        ...get().dir,
                        [UserStore.getCurrentUser()?.id]: {
                            data,
                            at,
                            revalidateAt,
                        },
                    },
                });
            },
            updateDir(user, data) {
                set({
                    dir: {
                        ...get().dir,
                        [user]: { ...data, listed: true },
                    },
                });
            },
            hasData: () => !!get().data && !!get().at,
        }),
        {
            name: "songspotlight-cache",
            storage: createJSONStorage(() => RNCacheModule),
            partialize: state => ({
                dir: Object.fromEntries(
                    Object.entries(state.dir).filter(([_, data]) =>
                        data.listed ? data.revalidateAt > Date.now() : true,
                    ),
                ),
            }),
            onRehydrateStorage: () => state => state?.init(),
        },
    ),
);

export const unsubCacheStore = fluxSubscribe("CONNECTION_OPEN", () => {
    useCacheStore.persist.rehydrate();
});
