import {
    clipboard,
    React,
    ReactNative as RN,
    stylesheet,
    url,
} from "@vendetta/metro/common";
import { semanticColors } from "@vendetta/ui";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { Forms } from "@vendetta/ui/components";
import { showToast } from "@vendetta/ui/toasts";

import Text from "$/components/Text";
import { ContextMenu } from "$/lib/redesign";

import { lang } from "../..";
import { getServiceLink, serviceToIcon } from "../../stuff/songs";
import { getSongInfo, SongInfo } from "../../stuff/songs/info";
import { Song } from "../../types";
import { ModifiedDataContext } from "../Settings";

const { FormRow } = Forms;

export default function SongInfo({
    song,
    disabled,
}: {
    song: Song;
    disabled: boolean;
}) {
    const styles = stylesheet.createThemedStyleSheet({
        song: {
            backgroundColor: semanticColors.BG_MOD_FAINT,
            borderRadius: 8,
        },
    });

    const [songInfo, setSongInfo] = React.useState<null | false | SongInfo>(
        null,
    );
    const { data, setData } = React.useContext(ModifiedDataContext);

    React.useEffect(() => {
        const res = getSongInfo(song);

        setSongInfo(null);
        if (res instanceof Promise)
            res.then(val => setSongInfo(val)).catch(() => setSongInfo(false));
        else setSongInfo(res);
    }, [song.service + song.type + song.id]);

    return (
        <ContextMenu
            title={lang.format("sheet.manage_song.title", {})}
            triggerOnLongPress
            align="below"
            items={[
                {
                    label: lang.format("sheet.manage_song.copy_link", {}),
                    variant: "default",
                    async action() {
                        const link = await getServiceLink(song, true);
                        if (link)
                            clipboard.setString(link),
                                showToast(
                                    lang.format("toast.copied_link", {}),
                                    getAssetIDByName("CopyIcon"),
                                );
                        else
                            return showToast(
                                lang.format("toast.cannot_open_link", {}),
                                getAssetIDByName("CircleXIcon-primary"),
                            );
                    },
                    iconSource: getAssetIDByName("LinkIcon"),
                },
                {
                    label: lang.format("sheet.manage_song.remove_song", {}),
                    variant: "destructive",
                    async action() {
                        showToast(
                            lang.format("toast.removed_song", {}),
                            getAssetIDByName("TrashIcon"),
                        );

                        const hash = song.service + song.type + song.id;
                        setData(
                            data.filter(
                                sng => sng.service + sng.type + sng.id !== hash,
                            ),
                        );
                    },
                    iconSource: getAssetIDByName("TrashIcon"),
                },
            ]}>
            {(props: any) => (
                <FormRow
                    label={
                        songInfo === null ? (
                            <RN.ActivityIndicator size="small" />
                        ) : songInfo === false ? (
                            "<err!>"
                        ) : (
                            songInfo.label
                        )
                    }
                    subLabel={songInfo ? songInfo.sublabel : undefined}
                    leading={
                        <FormRow.Icon source={serviceToIcon[song.service]} />
                    }
                    trailing={
                        <Text variant="eyebrow" color="TEXT_MUTED">
                            {song.type}
                        </Text>
                    }
                    style={styles.song}
                    disabled={disabled}
                    {...{
                        ...props,
                        onPress: async () => {
                            const link = await getServiceLink(song);
                            if (link !== false) url.openDeeplink(link);
                            else
                                showToast(
                                    lang.format("toast.cannot_open_link", {}),
                                    getAssetIDByName("CircleXIcon-primary"),
                                );
                        },
                    }}
                />
            )}
        </ContextMenu>
    );
}
