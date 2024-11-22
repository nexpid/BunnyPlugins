import { clipboard, stylesheet } from "@vendetta/metro/common";
import { semanticColors } from "@vendetta/ui";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { Forms } from "@vendetta/ui/components";
import { showToast } from "@vendetta/ui/toasts";

import { ActionSheet, hideActionSheet } from "$/components/ActionSheet";
import Text from "$/components/Text";

import { cache } from "../..";
import { check } from "../../stuff/http";
import { openSpotify, rebuildLink } from "../../stuff/util";
import { API } from "../../types/api";

const { FormRow } = Forms;

const destructiveText: Parameters<typeof Text>[0] = {
    color: "TEXT_DANGER",
    variant: "text-md/semibold",
};

export default function SongInfoSheet({
    song,
    showAdd,
    remove,
}: {
    song: API.Song;
    showAdd: boolean;
    remove?: () => void;
}) {
    const styles = stylesheet.createThemedStyleSheet({
        destructiveIcon: {
            tintColor: semanticColors.TEXT_DANGER,
        },
    });

    return (
        <ActionSheet title="Edit Song">
            {song.service === "spotify" && (
                <FormRow
                    label="Open in Spotify"
                    leading={
                        <FormRow.Icon
                            source={getAssetIDByName(
                                "img_account_sync_spotify_light_and_dark",
                            )}
                        />
                    }
                    onPress={() => {
                        openSpotify(`spotify://${song.type}/${song.id}`);
                        hideActionSheet();
                    }}
                />
            )}
            <FormRow
                label="Copy link"
                leading={<FormRow.Icon source={getAssetIDByName("copy")} />}
                onPress={() => {
                    clipboard.setString(
                        rebuildLink(song.service, song.type, song.id),
                    );
                    showToast(
                        "Copied to clipboard.",
                        getAssetIDByName("toast_copy_link"),
                    );
                    hideActionSheet();
                }}
            />
            {showAdd && (
                <FormRow
                    label="Add to your profile"
                    leading={
                        <FormRow.Icon source={getAssetIDByName("PinIcon")} />
                    }
                    onPress={() => {
                        hideActionSheet();

                        const songs = cache.data?.songs;
                        if (!songs) return;

                        const available = songs.findIndex(x => x === null);
                        if (available === -1) {
                            showToast(
                                "No space left!",
                                getAssetIDByName("CircleXIcon"),
                            );
                            return;
                        }

                        songs[available] = song;
                        check();

                        showToast(
                            "Added to your profile",
                            getAssetIDByName("CircleCheckIcon"),
                        );
                    }}
                />
            )}
            {remove && (
                <FormRow
                    label={<Text {...destructiveText}>Remove song</Text>}
                    leading={
                        <FormRow.Icon
                            style={styles.destructiveIcon}
                            source={getAssetIDByName("trash")}
                        />
                    }
                    onPress={() => {
                        remove();
                        showToast("Removed", getAssetIDByName("toast_trash"));
                        hideActionSheet();
                    }}
                />
            )}
        </ActionSheet>
    );
}
