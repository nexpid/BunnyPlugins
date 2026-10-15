import { NavigationNative, React, ReactNative as RN } from "@vendetta/metro/common";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { showToast } from "@vendetta/ui/toasts";

import { WebView } from "$/deps";
import { Button } from "$/lib/redesign";
import { managePage } from "$/lib/ui";

import { lang } from "../..";
import constants from "../../constants";
import { useAuthorizationStore } from "../../stores/AuthorizationStore";
import { getData } from "../../stuff/api";
import { buildOAuthURL } from "../../stuff/oauth2";

// In-app OAuth login: the backend answers the authorize redirect with the
// token as plain text, so read it straight out of the loaded page and finish
// authorization without any copy-paste.
export default function BrowserAuthPage() {
	const [done, setDone] = React.useState(false);
	const webview = React.useRef<any>(null);
	const navigation = NavigationNative.useNavigation();

	managePage({ title: "Log in with Discord" }, navigation);

	const apiBase = constants.api;

	const finish = async (raw: string) => {
		const token = (raw ?? "").trim();
		if (
			done
			|| !token
			|| token.startsWith("Missing")
			|| token.startsWith("Invalid")
			|| token.startsWith("Discord ratelimited")
			|| token.length < 10
		) {
			return;
		}

		setDone(true);
		useAuthorizationStore.getState().setToken(token);
		try {
			await getData();
			showToast(
				lang.format("toast.oauth.authorized", {}),
				getAssetIDByName("CircleCheckIcon-primary"),
			);
		} catch {
			useAuthorizationStore.getState().setToken(undefined);
			setDone(false);
			return;
		}
		navigation?.goBack?.();
	};

	// Runs at document start; the backend page has no scripts of its own,
	// so wait for load (body may not exist yet) before reporting its text.
	// A second read is triggered from onNavigationStateChange as backup.
	const captureJs = `(function(){function send(){try{if(location.href.indexOf(${
		JSON.stringify(apiBase)
	})===0){var t=document.body?document.body.innerText||"":"";if(t){window.ReactNativeWebView.postMessage(t);}}}catch(e){}}if(document.readyState==="complete"){send();}else{window.addEventListener("load",send);}})();true;`;

	return (
		<RN.View style={{ flex: 1 }}>
			{!done && (
				<WebView
					ref={webview}
					source={{ uri: buildOAuthURL() }}
					injectedJavaScript={captureJs}
					onNavigationStateChange={(nav: any) => {
						if (
							typeof nav?.url === "string"
							&& nav.url.indexOf(apiBase) === 0
							&& nav.loading === false
						) {
							webview.current?.injectJavaScript?.(captureJs);
						}
					}}
					onMessage={(event: any) => void finish(event?.nativeEvent?.data)}
					style={{ flex: 1 }}
				/>
			)}
			{done && (
				<RN.View
					style={{
						flex: 1,
						alignItems: "center",
						justifyContent: "center",
						gap: 16,
					}}
				>
					<RN.ActivityIndicator size="large" />
					<Button
						text="Return to settings"
						variant="secondary"
						size="md"
						onPress={() => navigation?.goBack?.()}
					/>
				</RN.View>
			)}
		</RN.View>
	);
}
