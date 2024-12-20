import { ReactNative as RN, url } from "@vendetta/metro/common";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { showToast } from "@vendetta/ui/toasts";
import { type ImageSourcePropType } from "react-native";

import AppleMusicIcon from "../../../assets/services/AppleMusicIcon.png";
import SoundcloudIcon from "../../../assets/services/SoundcloudIcon.png";
import { lang } from "../..";
import { AppleMusicSong, Song, SoundcloudSong, SpotifySong } from "../../types";
import { soundcloudUrl } from "./info";

// TODO icons
export const serviceToIcon = {
    spotify: getAssetIDByName("img_account_sync_spotify_light_and_dark"),
    soundcloud: SoundcloudIcon,
    applemusic: AppleMusicIcon,
} satisfies Record<Song["service"], ImageSourcePropType>;

const scLinkResolver = new Map<string, string | null>();

const serviceToApp = {
    spotify({ type, id }: SpotifySong) {
        return [
            `spotify://${type}/${id}`,
            `https://open.spotify.com/${type}/${id}`,
        ];
    },
    async soundcloud({ service, type, id }: SoundcloudSong) {
        const hash = service + type + id;

        let link = scLinkResolver.get(hash);
        if (link === null) return false;

        if (!link) {
            const res = await fetch(
                soundcloudUrl(
                    `https://api-widget.soundcloud.com/${type}s/${id}`,
                ),
                {
                    cache: "force-cache",
                    headers: {
                        "cache-control": "public; max-age=1800",
                    },
                },
            );
            if (res.status !== 200)
                return scLinkResolver.set(hash, null), false;

            try {
                link = (await res.json()).permalink_url;
                scLinkResolver.set(hash, link as string);
            } catch {
                scLinkResolver.set(hash, null);
                return false;
            }
        }

        return [
            link!.replace("https://soundcloud.com/", "soundcloud://"),
            link,
        ];
    },
    applemusic({ type, id }: AppleMusicSong) {
        // you literally just cannot open apple music on android. oh well
        return [
            `music://music.apple.com/${type}/ss/${id}`,
            `https://music.apple.com/${type}/ss/${id}`,
        ];
    },
} as Record<
    Song["service"],
    (song: any) => string[] | Promise<string[] | false>
>;

export async function getServiceLink(
    song: Song,
    dry?: boolean,
): Promise<string | false> {
    const links = await serviceToApp[song.service](song);
    if (!links) return false;

    if (dry) return links[links.length - 1] ?? links[0];

    for (const link of links)
        if (await RN.Linking.canOpenURL(link)) return link;
    return links[links.length - 1] ?? links[0];
}

export async function openLink(song: Song) {
    const link = await getServiceLink(song);
    if (link !== false) url.openDeeplink(link);
    else
        showToast(
            lang.format("toast.cannot_open_link", {}),
            getAssetIDByName("CircleXIcon-primary"),
        );
}
