import { React } from "@vendetta/metro/common";
import { type VideoRef } from "react-native-video";

import { Video } from "$/deps";

import { SongInfo } from "../stuff/songs/info";

export interface AudioPlayer {
    play(url?: string): void;
    pause(): void;
    current: string | null;
}

type Listener = (topic: "STOP_ALL") => void;
const listeners = new Set<Listener>();

// i :heart: hacky stuff
const didDoLastSeekYesOrNo: Record<string, boolean> = {};
function doSeek(vid: VideoRef) {
    const url = (vid as any).props.source.uri;
    vid.seek(didDoLastSeekYesOrNo[url] ? 0.01 : 0, 1);
    didDoLastSeekYesOrNo[url] = !didDoLastSeekYesOrNo[url];
}

console.log("BCgA");

export default function AudioPlayer({
    song,
    children,
}: {
    song: SongInfo;
    children: ({
        player,
        loaded,
    }: {
        player: AudioPlayer;
        loaded: string[];
        resolved: string[];
    }) => React.ReactNode;
}) {
    const videos = React.useRef<Record<string, VideoRef>>({});
    const [resolved, setResolved] = React.useState<Record<string, boolean>>({});
    const [audioPlayerCurrent, setAudioPlayerCurrent] = React.useState<
        string | null
    >(null);

    const audioPlayer = React.useRef<Omit<AudioPlayer, "current">>({
        play() {},
        pause() {},
    });
    audioPlayer.current = {
        play(url) {
            let vid: VideoRef;
            if (url && resolved[url]) vid = videos.current[url];
            else if (!url) {
                const first = Object.entries(resolved).find(
                    ([_, res]) => res,
                )?.[0];
                if (first) (url = first), (vid = videos.current[url]);
                else return;
            } else return;

            if (!vid) return;

            listeners.forEach(x => x("STOP_ALL"));
            doSeek(vid);
            setAudioPlayerCurrent(url);
        },
        pause() {
            setAudioPlayerCurrent(null);
        },
    };

    React.useEffect(() => {
        const listener: Listener = topic =>
            topic === "STOP_ALL" && audioPlayer.current.pause();

        listeners.add(listener);
        return () => void listeners.delete(listener);
    });

    const songs = (
        song.type === "single"
            ? [song.previewUrl]
            : song.entries.map(x => x.previewUrl)
    ).filter(x => !!x) as string[];

    return (
        <>
            {songs.map((sng, i) => (
                <Video
                    source={{
                        uri: sng,
                        shouldCache: true,
                        headers: [
                            {
                                key: "cache-control",
                                value: "max-age=7200",
                            },
                        ],
                    }}
                    ref={vid =>
                        vid &&
                        (videos.current = {
                            ...videos.current,
                            [sng]: vid,
                        })
                    }
                    onLoad={() =>
                        setResolved({
                            ...resolved,
                            [sng]: true,
                        })
                    }
                    onError={err => (
                        console.log(err, sng),
                        setResolved({
                            ...resolved,
                            [sng]: false,
                        })
                    )}
                    onEnd={() => {
                        listeners.forEach(x => x("STOP_ALL"));

                        const next = songs.find(
                            (nextSng, nextI) => nextI > i && resolved[nextSng],
                        );
                        if (next && videos.current[next]) {
                            doSeek(videos.current[next]);
                            setAudioPlayerCurrent(next);
                        } else setAudioPlayerCurrent(null);
                    }}
                    paused={audioPlayerCurrent !== sng}
                    volume={1}
                    key={sng}
                />
            ))}
            {children({
                player: {
                    get play() {
                        return audioPlayer.current.play;
                    },
                    get pause() {
                        return audioPlayer.current.pause;
                    },
                    get current() {
                        return audioPlayerCurrent;
                    },
                },
                loaded: Object.entries(resolved)
                    .filter(([_, res]) => res)
                    .map(([sng]) => sng),
                resolved: Object.keys(resolved),
            })}
        </>
    );
}
