import { React, ReactNative as RN, stylesheet } from "@vendetta/metro/common";
import { semanticColors } from "@vendetta/ui";
import { getAssetIDByName } from "@vendetta/ui/assets";

import Text from "$/components/Text";
import { Reanimated } from "$/deps";
import { IconButton, PressableScale, Stack } from "$/lib/redesign";
import { formatDuration } from "$/types";

import { openLink } from "../../stuff/songs";
import {
    getSongInfo,
    skeletonSongInfo,
    SongInfo,
} from "../../stuff/songs/info";
import { Song } from "../../types";

export default function ProfileSong({
    song,
    themed,
    customBorder,
}: {
    song: Song;
    themed?: boolean;
    customBorder?: string;
}) {
    const isSingle = ["album", "playlist", "artist", "user"].includes(
        song.type,
    );

    const [_songInfo, setSongInfo] = React.useState<null | false | SongInfo>(
        null,
    );
    const songInfo =
        _songInfo ||
        (isSingle ? skeletonSongInfo.single : skeletonSongInfo.entries);

    React.useEffect(() => {
        const res = getSongInfo(song);

        setSongInfo(null);
        if (res instanceof Promise)
            res.then(val => setSongInfo(val)).catch(() => setSongInfo(false));
        else setSongInfo(res);
    }, [song.service + song.type + song.id]);

    const styles = stylesheet.createThemedStyleSheet({
        card: {
            width: "100%",
            backgroundColor: semanticColors.CARD_PRIMARY_BG,
            borderColor: semanticColors.BORDER_SUBTLE,
            borderWidth: 1,
            borderRadius: 10,
            padding: 10,
        },
        themedCard: {
            backgroundColor: "#1113",
            borderColor: customBorder ?? semanticColors.BORDER_SUBTLE,
        },
        noCard: {
            backgroundColor: semanticColors.CARD_SECONDARY_BG,
            borderRadius: 10,
            borderColor: semanticColors.CARD_SECONDARY_BG,
        },
        themedNoCard: {
            backgroundColor: "#0003",
            borderColor: "#0003",
        },
        thumbnail: {
            width: 64,
            height: 64,
            borderRadius: 8,
        },
        explicit: {
            width: 18,
            height: 18,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 4,
            backgroundColor: semanticColors.BG_MOD_SUBTLE,
        },
    });

    const cardThing = () => ({
        ...styles.card,
        ...(_songInfo && themed && styles.themedCard),
        ...(!_songInfo && styles.noCard),
        ...(!_songInfo && themed && styles.themedNoCard),
    });

    const opacityValue = Reanimated.useSharedValue(_songInfo ? 1 : 0);
    const backgroundColor = Reanimated.useSharedValue(
        cardThing().backgroundColor,
    );
    const borderColor = Reanimated.useSharedValue(cardThing().borderColor);

    React.useEffect(() => {
        opacityValue.value = Reanimated.withTiming(_songInfo ? 1 : 0, {
            duration: 150,
        });
        backgroundColor.value = Reanimated.withTiming(
            cardThing().backgroundColor,
            { duration: 150 },
        );
        borderColor.value = Reanimated.withTiming(cardThing().borderColor, {
            duration: 150,
        });
    }, [!!_songInfo]);

    return (
        <Reanimated.default.View
            style={[
                [styles.card, themed && _songInfo && styles.themedCard],
                !_songInfo && [styles.noCard, themed && styles.themedNoCard],
                { backgroundColor, borderColor },
            ]}>
            <Reanimated.default.View
                style={[
                    { opacity: _songInfo ? 1 : 0 },
                    { opacity: opacityValue },
                ]}>
                <Stack direction="horizontal" spacing={12}>
                    <PressableScale onPress={() => openLink(song)}>
                        <RN.Image
                            source={{
                                uri: songInfo.thumbnailUrl,
                                width: 64,
                                height: 64,
                                cache: "force-cache",
                            }}
                            style={styles.thumbnail}
                        />
                    </PressableScale>
                    <Stack spacing={-1}>
                        <Stack direction="horizontal" spacing={8}>
                            <Text variant="text-md/bold" color="TEXT_NORMAL">
                                {songInfo.label}
                            </Text>
                            {songInfo.type === "single" &&
                                songInfo.explicit && (
                                    <RN.View style={styles.explicit}>
                                        <Text
                                            variant="text-sm/bold"
                                            color="TEXT_NORMAL">
                                            E
                                        </Text>
                                    </RN.View>
                                )}
                        </Stack>
                        <Text
                            variant="text-md/normal"
                            color="TEXT_MUTED"
                            lineClamp={1}
                            style={{ width: "65%" }}>
                            {songInfo.sublabel}
                        </Text>
                    </Stack>
                    <RN.View style={{ marginLeft: "auto", marginTop: "auto" }}>
                        <Stack
                            direction="horizontal"
                            spacing={8}
                            style={{
                                alignSelf: "flex-end",
                                alignItems: "flex-end",
                            }}>
                            {songInfo.type === "single" && (
                                <Text
                                    variant="text-md/medium"
                                    color="TEXT_MUTED">
                                    {formatDuration(
                                        Math.ceil(songInfo.duration / 1000),
                                    )}
                                </Text>
                            )}
                            <IconButton
                                variant="secondary"
                                icon={getAssetIDByName("PlayIcon")}
                                size="sm"
                            />
                        </Stack>
                    </RN.View>
                    {/* <IconButton
                    variant="secondary"
                    icon={serviceToIcon[song.service]}
                    size="sm"
                    style={{ marginLeft: "auto", marginBottom: "auto" }}
                /> */}
                </Stack>
            </Reanimated.default.View>
        </Reanimated.default.View>
    );
}
