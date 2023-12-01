import { findByName, findByProps, findByStoreName } from "@vendetta/metro";
import { getOauth2Response } from "./api";
import { fillCache, vstorage } from "..";
import { showToast } from "@vendetta/ui/toasts";
import { getAssetIDByName } from "@vendetta/ui/assets";
import constants from "../constants";

const { pushModal, popModal } = findByProps("pushModal", "popModal");
const OAuth2AuthorizeModal = findByName("OAuth2AuthorizeModal");
const UserStore = findByStoreName("UserStore");

export function openOauth2Modal() {
  pushModal({
    key: "oauth2-authorize",
    modal: {
      key: "oauth2-authorize",
      modal: OAuth2AuthorizeModal,
      animation: "slide-up",

      shouldPersistUnderModals: false,
      props: {
        clientId: constants.oauth2.clientId,
        redirectUri: constants.oauth2.redirectURL,

        scopes: ["identify"],
        responseType: "code",
        permissions: 0n,
        cancelCompletesFlow: false,
        callback: async ({ location }) => {
          if (!location) return;
          try {
            const url = new URL(location);
            const code = url.searchParams.get("code");

            const token = await getOauth2Response(code);
            vstorage.auth ??= {};
            vstorage.auth[UserStore.getCurrentUser().id] = token;
            fillCache();

            showToast("Successfully authenticated", getAssetIDByName("Check"));
          } catch (e: any) {
            showToast(String(e), getAssetIDByName("Small"));
          }
        },
        dismissOAuthModal: () => popModal("oauth2-authorize"),
      },
      closable: true,
    },
  });
}
