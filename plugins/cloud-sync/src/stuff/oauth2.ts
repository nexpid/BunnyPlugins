import { findByName, findByProps } from "@vendetta/metro";
import * as constants from "./constants";
import { getOauth2Response } from "./api";
import { fillCache, vstorage } from "..";
import { showToast } from "@vendetta/ui/toasts";
import { getAssetIDByName } from "@vendetta/ui/assets";

const { pushModal, popModal } = findByProps("pushModal", "popModal");
const OAuth2AuthorizeModal = findByName("OAuth2AuthorizeModal");

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
          try {
            const url = new URL(location);
            const code = url.searchParams.get("code");

            const token = await getOauth2Response(code);
            vstorage.authorization = token;
            fillCache();

            showToast("Successfully authenticated", getAssetIDByName("Check"));
          } catch (e: any) {
            showToast(
              e?.message ??
                e?.toString() ??
                "An error occured during authentication",
              getAssetIDByName("Small")
            );
          }
        },
        dismissOAuthModal: () => popModal("oauth2-authorize"),
      },
      closable: true,
    },
  });
}
