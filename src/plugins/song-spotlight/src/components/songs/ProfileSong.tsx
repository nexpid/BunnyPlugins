import { React, ReactNative as RN, stylesheet } from "@vendetta/metro/common";
import { semanticColors } from "@vendetta/ui";
import { getAssetIDByName } from "@vendetta/ui/assets";

import Text from "$/components/Text";
import { FlashList, Reanimated } from "$/deps";
import { IconButton, PressableScale, Stack } from "$/lib/redesign";
import { formatDuration } from "$/types";

import { openLink } from "../../stuff/songs";
import {
    getSongInfo,
    skeletonSongInfo,
    SongInfo,
} from "../../stuff/songs/info";
import { Song } from "../../types";
import AudioPlayer from "../AudioPlayer";
import { EntrySong } from "./EntrySong";

const minTracksInEntriesView = 3;

export default function ProfileSong({
    song,
    themed,
    customBorder,
}: {
    song: Song;
    themed?: boolean;
    customBorder?: string;
}) {
    const isEntries = ["album", "playlist", "artist", "user"].includes(
        song.type,
    );

    const [_songInfo, setSongInfo] = React.useState<null | false | SongInfo>(
        null,
    );
    const songInfo =
        _songInfo ||
        (isEntries ? skeletonSongInfo.entries : skeletonSongInfo.single);

    React.useEffect(() => {
        setSongInfo(null);

        getSongInfo(song)
            .then(val => setTimeout(() => setSongInfo(val), 1000))
            .catch(() => setSongInfo(false));
    }, [song.service + song.type + song.id]);

    const styles = stylesheet.createThemedStyleSheet({
        card: {
            width: "100%",
            backgroundColor: semanticColors.CARD_PRIMARY_BG,
            borderColor: semanticColors.BORDER_SUBTLE,
            borderWidth: 1,
            borderRadius: 10,
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
            backgroundColor: "#fff2",
        },
        entriesMain: {
            borderTopColor: customBorder ?? semanticColors.BORDER_SUBTLE,
            borderTopWidth: 1,
            paddingHorizontal: 10,
            height:
                36 * minTracksInEntriesView +
                4 * (minTracksInEntriesView - 1) +
                10 * 2,
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
        const cfg = {
            duration: 150,
        };
        backgroundColor.value = Reanimated.withTiming(
            cardThing().backgroundColor,
            cfg,
        );
        borderColor.value = Reanimated.withTiming(cardThing().borderColor, cfg);
        opacityValue.value = Reanimated.withTiming(_songInfo ? 1 : 0, cfg);
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
                ]}
                key={"body"}>
                <AudioPlayer song={songInfo}>
                    {({ player, loaded, resolved }) => (
                        <>
                            <Stack
                                direction="horizontal"
                                spacing={12}
                                style={{ padding: 10 }}>
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
                                        <Text
                                            variant="text-md/bold"
                                            color="TEXT_NORMAL">
                                            {songInfo.label}
                                        </Text>
                                        {songInfo.type === "single" &&
                                            songInfo.explicit && (
                                                <RN.View
                                                    style={styles.explicit}>
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
                                <RN.View
                                    style={{
                                        marginLeft: "auto",
                                        marginTop: "auto",
                                    }}>
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
                                                    Math.ceil(
                                                        songInfo.duration /
                                                            1000,
                                                    ),
                                                )}
                                            </Text>
                                        )}
                                        {songInfo.type === "single" && (
                                            <IconButton
                                                variant="secondary"
                                                icon={
                                                    player.current ===
                                                    songInfo.previewUrl
                                                        ? getAssetIDByName(
                                                              "PauseIcon",
                                                          )
                                                        : getAssetIDByName(
                                                              "PlayIcon",
                                                          )
                                                }
                                                size="sm"
                                                loading={
                                                    songInfo.previewUrl
                                                        ? !resolved.includes(
                                                              songInfo.previewUrl,
                                                          )
                                                        : false
                                                }
                                                disabled={
                                                    !songInfo.previewUrl ||
                                                    !loaded.includes(
                                                        songInfo.previewUrl,
                                                    )
                                                }
                                                onPress={() =>
                                                    player.current ===
                                                    songInfo.previewUrl
                                                        ? player.pause()
                                                        : player.play(
                                                              songInfo.previewUrl,
                                                          )
                                                }
                                            />
                                        )}
                                    </Stack>
                                </RN.View>
                            </Stack>
                            {songInfo.type === "entries" && (
                                <RN.View style={styles.entriesMain}>
                                    <FlashList
                                        data={songInfo.entries}
                                        keyExtractor={item => item.id}
                                        nestedScrollEnabled
                                        scrollEnabled
                                        estimatedItemSize={36}
                                        ItemSeparatorComponent={() => (
                                            <RN.View style={{ height: 4 }} />
                                        )}
                                        ListHeaderComponent={() => (
                                            <RN.View style={{ height: 5 }} />
                                        )}
                                        ListFooterComponent={() => (
                                            <RN.View style={{ height: 5 }} />
                                        )}
                                        extraData={[
                                            player.current,
                                            loaded.length,
                                        ]}
                                        renderItem={({ item, index }) => (
                                            <EntrySong
                                                item={item}
                                                index={index}
                                                player={player}
                                                isLoaded={
                                                    item.previewUrl
                                                        ? loaded.includes(
                                                              item.previewUrl,
                                                          )
                                                        : false
                                                }
                                            />
                                        )}></FlashList>
                                </RN.View>
                            )}
                        </>
                    )}
                </AudioPlayer>
            </Reanimated.default.View>
        </Reanimated.default.View>
    );
}
