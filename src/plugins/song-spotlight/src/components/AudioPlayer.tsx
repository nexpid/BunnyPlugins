import { React } from "@vendetta/metro/common";

import { MobileAudioSound } from "$/deps";

import { SongInfo } from "../stuff/songs/info";

export interface AudioPlayer {
    play(urlOrNext?: string | true): void;
    pause(): void;
    current: string | null;
}

export default function AudioPlayer({
    song,
    playing,
    children,
}: {
    song: SongInfo;
    playing: {
        currentlyPlaying: string | null;
        setCurrentlyPlaying: (value: string | null) => void;
    };
    children: ({
        player,
        loaded,
    }: {
        player: AudioPlayer;
        loaded: string[];
        resolved: string[];
    }) => React.ReactNode;
}) {
    const { currentlyPlaying, setCurrentlyPlaying } = playing;

    const sounds = React.useRef<Record<string, MobileAudioSound>>({});
    const [resolved, setResolved] = React.useState<Record<string, boolean>>({});

    const audioPlayer = React.useRef<Omit<AudioPlayer, "current">>({
        play() {},
        pause() {},
    });
    audioPlayer.current = {
        play(urlOrNext) {
            const resolveds = Object.entries(resolved)
                .filter(([_, val]) => val)
                .map(([key]) => key);

            if (typeof urlOrNext === "string" && resolved[urlOrNext])
                setCurrentlyPlaying(urlOrNext);
            else if (urlOrNext === true) {
                const index = currentlyPlaying
                    ? resolveds.indexOf(currentlyPlaying)
                    : -1;
                const url = resolveds[index + 1];

                if (url) setCurrentlyPlaying(url);
                else setCurrentlyPlaying(null);
            } else if (!urlOrNext && resolveds[0])
                setCurrentlyPlaying(resolveds[0]);
        },
        pause() {
            setCurrentlyPlaying(null);
        },
    };

    const songs = (
        song.type === "single"
            ? [song.previewUrl]
            : song.entries.map(x => x.previewUrl)
    ).filter(x => !!x) as string[];

    React.useEffect(() => {
        if (currentlyPlaying) sounds.current[currentlyPlaying]?.stop();

        sounds.current = Object.fromEntries(
            songs.map((url, i) => [
                url,
                new MobileAudioSound(url, "media", 1, {
                    onLoad(val) {
                        setResolved(res => ({
                            ...res,
                            [url]: val,
                        }));
                    },
                    onEnd() {
                        const next = songs.find(
                            (nextSng, nextI) => nextI > i && resolved[nextSng],
                        );
                        if (next && sounds.current[next])
                            setCurrentlyPlaying(next);
                        else setCurrentlyPlaying(null);
                    },
                }),
            ]),
        );
    }, [songs.join(" ")]);

    React.useEffect(
        () =>
            Object.entries(sounds.current).forEach(([url, snd]) =>
                currentlyPlaying === url
                    ? !snd.isPlaying && snd.play()
                    : snd.isPlaying && snd.stop(),
            ),
        [currentlyPlaying],
    );

    return (
        <>
            {children({
                player: {
                    get play() {
                        return audioPlayer.current.play;
                    },
                    get pause() {
                        return audioPlayer.current.pause;
                    },
                    get current() {
                        return playing.currentlyPlaying &&
                            songs.includes(playing.currentlyPlaying)
                            ? playing.currentlyPlaying
                            : null;
                    },
                },
                loaded: Object.entries(resolved)
                    .filter(([_, res]) => res)
                    .map(([url]) => url),
                resolved: Object.keys(resolved),
            })}
        </>
    );
}
