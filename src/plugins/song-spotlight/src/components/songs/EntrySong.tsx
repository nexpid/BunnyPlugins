import { ReactNative as RN, stylesheet } from "@vendetta/metro/common";
import { semanticColors } from "@vendetta/ui";
import { getAssetIDByName } from "@vendetta/ui/assets";

import Text from "$/components/Text";
import { PressableScale, Stack } from "$/lib/redesign";

import { SongInfoEntry } from "../../stuff/songs/info";
import { AudioPlayer } from "../AudioPlayer";

export function EntrySong({
    player,
    item,
    index,
    isLoaded,
}: {
    player: AudioPlayer;
    item: SongInfoEntry;
    index: number;
    isLoaded: boolean;
}) {
    const styles = stylesheet.createThemedStyleSheet({
        indexCont: {
            width: 24,
            alignItems: "center",
            justifyContent: "center",
        },
        pauseIcon: {
            width: 18,
            height: 18,
            tintColor: semanticColors.INTERACTIVE_NORMAL,
        },
    });

    return (
        <PressableScale
            onPress={() =>
                isLoaded &&
                item.previewUrl &&
                (player.current === item.previewUrl
                    ? player.pause()
                    : player.play(item.previewUrl))
            }
            style={!isLoaded ? { opacity: 0.5 } : {}}
            disabled={!isLoaded}>
            <Stack
                direction="horizontal"
                spacing={8}
                style={{ alignItems: "center" }}>
                <RN.View
                    style={{
                        width: 24,
                        alignItems: "center",
                        justifyContent: "center",
                    }}>
                    {player.current === item.previewUrl ? (
                        <RN.Image
                            source={getAssetIDByName("PauseIcon")}
                            style={styles.pauseIcon}
                        />
                    ) : (
                        <Text
                            variant="text-md/medium"
                            color="TEXT_NORMAL"
                            align="center">
                            {index + 1}
                        </Text>
                    )}
                </RN.View>
                <Stack spacing={0}>
                    <Text
                        variant="text-sm/medium"
                        color="TEXT_NORMAL"
                        lineClamp={1}>
                        {item.label}
                    </Text>
                    <Text
                        variant="text-sm/normal"
                        color="TEXT_MUTED"
                        lineClamp={1}>
                        {item.sublabel}
                    </Text>
                </Stack>
            </Stack>
        </PressableScale>
    );
}
