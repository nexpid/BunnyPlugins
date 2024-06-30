// https://github.com/decor-discord/vendetta-plugin/blob/main/src/lib/stores/AuthorizationStore.ts
import { findByStoreName } from "@vendetta/metro";
import { persist } from "zustand/middleware";

import { RNMMKVManager, zustand } from "$/deps";
import { fluxSubscribe } from "$/types";

const UserStore = findByStoreName("UserStore");

interface AuthorizationState {
  token: string | null;
  tokens: Record<string, string>;
  init: () => void;
  setToken: (token: string | null) => void;
  isAuthorized: () => boolean;
}

export const useAuthorizationStore = zustand.create<
  AuthorizationState,
  [["zustand/persist", { tokens: AuthorizationState["tokens"] }]]
>(
  persist(
    (set, get) => ({
      token: null,
      tokens: {},
      init: () =>
        set({ token: get().tokens[UserStore.getCurrentUser()?.id] ?? null }),
      setToken: (token: string | null) =>
        set({
          token,
          tokens: { ...get().tokens, [UserStore.getCurrentUser()?.id]: token },
        }),
      isAuthorized: () => !!get().token,
    }),
    {
      name: "cloudsync-auth",
      getStorage: () => RNMMKVManager,
      partialize: (state) => ({ tokens: state.tokens }),
      onRehydrateStorage: () => (state) => state.init(),
    },
  ),
);

export const unsubAuthStore = fluxSubscribe("CONNECTION_OPEN", () =>
  useAuthorizationStore.persist.rehydrate(),
);
