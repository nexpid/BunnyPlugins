import { React } from "@vendetta/metro/common";

import { getSongInfo, SongInfo } from "../../stuff/songs/info";
import { Song } from "../../types";

const singleAspectRatio = 3 / 8;
const entriesAspectRatio = 7 / 8;

export default function ProfileSong({ song }: { song: Song }) {
    const [songInfo, setSongInfo] = React.useState<null | false | SongInfo>(
        null,
    );

    React.useEffect(() => {
        const res = getSongInfo(song);

        setSongInfo(null);
        if (res instanceof Promise)
            res.then(val => setSongInfo(val)).catch(() => setSongInfo(false));
        else setSongInfo(res);
    }, [song.service + song.type + song.id]);

    return null;
}
