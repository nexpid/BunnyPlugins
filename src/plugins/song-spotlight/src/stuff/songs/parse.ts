import { Song } from "../../types";

const services = [
    async function spotify(link) {
        if (link.hostname === "spotify.link")
            link = new URL((await fetch(link)).url);

        if (link.hostname === "open.spotify.com") {
            const [type, id, _] = link.pathname.slice(1).split("/");
            if (
                !["track", "album", "playlist", "artist"].includes(type) ||
                !id ||
                _
            )
                return null;

            return {
                service: "spotify",
                type,
                id,
            };
        }

        return null;
    },
    async function soundcloud(link) {
        if (link.hostname === "soundcloud.com") {
            const [user, trackOrSets, track, _] = link.pathname
                .slice(1)
                .split("/");
            const isValid =
                (user && !trackOrSets) ||
                (user && trackOrSets && trackOrSets !== "sets" && !track) ||
                (user && trackOrSets === "sets" && track && !_);
            if (!isValid) return null;

            const embedded = await fetch(
                `https://soundcloud.com/oembed?format=json&url=${encodeURIComponent(link.toString())}`,
            ).then(x => x.json());
            if (!embedded.html) return null;

            const url = embedded.html.match(/src="(http.+?)"/)?.[1];
            if (!url) return null;

            const apiUrl = new URL(url).searchParams.get("url");
            if (!apiUrl) return null;

            const splits = apiUrl.split("/");
            return {
                service: "soundcloud",
                type: splits[3].slice(0, -1),
                id: splits[4],
            };
        }

        return null;
    },
    async function applemusic(link) {
        if (link.hostname === "music.apple.com") {
            let splits = link.pathname.slice(1).split("/");
            if (splits[0].length <= 3) splits = splits.slice(1);

            const [type, name, id, _] = splits;
            if (
                !["artist", "album", "playlist", "song"].includes(type) ||
                !name ||
                !id ||
                _
            )
                return null;

            return {
                service: "applemusic",
                type,
                id,
            };
        }

        return null;
    },
] as ((url: URL) => Promise<Song | null>)[];

const parseCacheSymbol = Symbol.for("songspotlight.cache.linktosong");
(window as any)[parseCacheSymbol] ??= new Map();

export function resolveLinkToSong(
    link: string,
): null | Song | Promise<null | Song> {
    const clean = new URL(link);
    clean.protocol = "https";
    clean.search = "";

    const cleaned = clean.toString();
    if ((window as any)[parseCacheSymbol].has(cleaned))
        return (window as any)[parseCacheSymbol].get(cleaned)!;

    return (async () => {
        for (const service of services) {
            const res = await service(clean);
            if (res) {
                (window as any)[parseCacheSymbol].set(cleaned, res);
                return res;
            }
        }

        (window as any)[parseCacheSymbol].set(cleaned, null);
        return null;
    })();
}
