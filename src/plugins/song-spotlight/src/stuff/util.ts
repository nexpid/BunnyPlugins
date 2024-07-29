import { ReactNative as RN, url } from "@vendetta/metro/common";

import { API } from "../types/api";

export const rebuildLink = (
    _service: API.Song["service"],
    type: API.Song["type"],
    id: API.Song["id"],
): string => `https://open.spotify.com/${type}/${id}`;

export async function openSpotify(uri: string) {
    if (await RN.Linking.canOpenURL(uri)) url.openDeeplink(uri);
    else if (
        await RN.Linking.canOpenURL("market://details?id=com.spotify.music")
    )
        url.openDeeplink("market://details?id=com.spotify.music");
    else url.openDeeplink("itms-apps://itunes.apple.com/app/id324684580");
}
