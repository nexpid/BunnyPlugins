import { ReactNative as RN, url } from "@vendetta/metro/common";

import { API } from "../types/api";

export const rebuildLink = (
    service: API.Song["service"],
    type: API.Song["type"],
    id: API.Song["id"],
): string =>
    service === "spotify"
        ? `https://open.spotify.com/${type}/${id}`
        : undefined;

export async function openSpotify(uri: string) {
    if (await RN.Linking.canOpenURL(uri)) url.openDeeplink(uri);
    else if (
        await RN.Linking.canOpenURL("market://details?id=com.spotify.music")
    )
        url.openDeeplink("market://details?id=com.spotify.music");
    else url.openDeeplink("itms-apps://itunes.apple.com/app/id324684580");
}
