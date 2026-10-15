import { findByName, findByProps } from "@vendetta/metro";
import { url } from "@vendetta/metro/common";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { showToast } from "@vendetta/ui/toasts";

import { lang } from "..";
import constants from "../constants";
import { useAuthorizationStore } from "../stores/AuthorizationStore";
import { authFetch, getData } from "./api";

// Resolved lazily at call time (not module scope): if Discord renames the
// modal modules in a future build, a failed lookup shows a toast instead of
// breaking the entire plugin at import.
function getModalModules() {
	const { pushModal, popModal } = findByProps("pushModal", "popModal") ?? {};
	const OAuth2AuthorizeModal = (() => {
		try {
			return findByName("OAuth2AuthorizeModal");
		} catch {
			return undefined;
		}
	})();
	return { pushModal, popModal, OAuth2AuthorizeModal };
}

export function buildOAuthURL() {
	const params = new URLSearchParams({
		client_id: constants.oauth2.clientId,
		redirect_uri: constants.oauth2.redirectURL,
		response_type: "code",
		scope: "identify",
	});
	return `https://discord.com/oauth2/authorize?${params.toString()}`;
}

export function openOauth2Modal() {
	const { pushModal, popModal, OAuth2AuthorizeModal } = getModalModules();
	if (!pushModal || !popModal || !OAuth2AuthorizeModal) {
		// In-app OAuth modal is gone on this Discord version:
		// send the user through the browser instead, the backend
		// shows the token as plain text for manual paste.
		url.openURL(buildOAuthURL());
		showToast(
			"Browser opened — copy the token shown and paste it in settings",
			getAssetIDByName("LinkIcon"),
		);
		return;
	}
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
						const token = await (await authFetch(location))?.text();
						useAuthorizationStore.getState().setToken(token);
						getData();

						showToast(
							lang.format("toast.oauth.authorized", {}),
							getAssetIDByName("CircleCheckIcon-primary"),
						);
					} catch {
						// handled in authFetch
					}
				},
				dismissOAuthModal: () => popModal("oauth2-authorize"),
			},
			closable: true,
		},
	});
}
