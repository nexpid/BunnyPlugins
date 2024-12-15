import { findByStoreName } from "@vendetta/metro";
import { React, ReactNative as RN, stylesheet } from "@vendetta/metro/common";
import { useProxy } from "@vendetta/storage";
import { semanticColors } from "@vendetta/ui";
import { showConfirmationAlert } from "@vendetta/ui/alerts";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { Forms } from "@vendetta/ui/components";
import { showToast } from "@vendetta/ui/toasts";

import { BetterTableRowGroup } from "$/components/BetterTableRow";
import Text from "$/components/Text";
import { Button } from "$/lib/redesign";
import { managePage } from "$/lib/ui";
import { deepEquals } from "$/types";

import { initState, lang, vstorage } from "..";
import { useAuthorizationStore } from "../stores/AuthorizationStore";
import { useCacheStore } from "../stores/CacheStore";
import { deleteData, getData, saveData } from "../stuff/api";
import { openOauth2Modal } from "../stuff/oauth2";
import { UserData } from "../types";
import AddSong from "./songs/AddSong";
import SongInfo from "./songs/SongInfo";

const { FormRow } = Forms;

const UserStore = findByStoreName("UserStore");

export const ModifiedDataContext = React.createContext({
    data: [],
    setData: () => null,
} as {
    data: UserData;
    setData: (data: UserData) => void;
});

export default function () {
    useProxy(vstorage);

    const styles = stylesheet.createThemedStyleSheet({
        songList: {
            flexDirection: "column",
            gap: 8,
        },
        songDisabled: {
            backgroundColor: semanticColors.BG_MOD_FAINT,
            borderRadius: 8,
            opacity: 0.4,
        },
    });

    const { isAuthorized } = useAuthorizationStore();
    const [isFetching, setIsFetching] = React.useState(false);

    const { data: _data } = useCacheStore();
    const [data, setData] = React.useState(_data);
    const isDataModified = React.useMemo(
        () => data && _data && !deepEquals(data, _data),
        [data, _data],
    );

    React.useEffect(() => setData(_data), [_data]);

    const userId = UserStore.getCurrentUser()?.id ?? null;
    if (!initState.inits.includes(userId)) {
        initState.inits.push(userId);
        isAuthorized() &&
            (setIsFetching(true),
            getData().finally(() => setIsFetching(false)));
    }

    const [isBusy, setIsBusy] = React.useState<string[]>([]);

    const setBusy = (x: string) =>
        !isBusy.includes(x) && setIsBusy([...isBusy, x]);
    const unBusy = (x: string) => void setIsBusy(isBusy.filter(y => x !== y));

    managePage(
        {
            headerRight: () => (
                <Button
                    size="sm"
                    variant={
                        isDataModified && !isFetching ? "primary" : "secondary"
                    }
                    disabled={!isDataModified || isFetching}
                    loading={isFetching}
                    text={lang.format("settings.update_songs", {})}
                    onPress={() => {
                        setIsFetching(true);
                        saveData(data!)
                            .then(() =>
                                showToast(
                                    lang.format("toast.updated_songs", {}),
                                    getAssetIDByName("UploadIcon"),
                                ),
                            )
                            .finally(() => setIsFetching(false));
                    }}
                />
            ),
        },
        null,
        isDataModified,
        isFetching,
    );

    return (
        <ModifiedDataContext.Provider value={{ data: data ?? [], setData }}>
            <RN.ScrollView>
                <BetterTableRowGroup
                    title={lang.format("settings.songs.title", {})}
                    icon={getAssetIDByName("MusicIcon")}
                    padding>
                    {isAuthorized() && data ? (
                        <RN.View
                            style={[
                                styles.songList,
                                isFetching && { opacity: 0.8 },
                            ]}>
                            {new Array(6)
                                .fill(null)
                                .map((_, i) =>
                                    !data[i] && data[i - 1] ? (
                                        <AddSong disabled={isFetching} />
                                    ) : data[i] ? (
                                        <SongInfo
                                            song={data[i]}
                                            disabled={isFetching}
                                        />
                                    ) : (
                                        <FormRow
                                            label=""
                                            style={styles.songDisabled}
                                        />
                                    ),
                                )}
                        </RN.View>
                    ) : !isAuthorized() ? (
                        <Text
                            variant="text-md/semibold"
                            color="TEXT_NORMAL"
                            align="center">
                            {lang.format("settings.songs.auth_needed", {})}
                        </Text>
                    ) : (
                        <RN.ActivityIndicator
                            size="small"
                            style={{ flex: 1 }}
                        />
                    )}
                </BetterTableRowGroup>
                <BetterTableRowGroup
                    title="Authentication"
                    icon={getAssetIDByName("LockIcon")}>
                    {isAuthorized() ? (
                        <>
                            <FormRow
                                label={lang.format(
                                    "settings.auth.log_out.title",
                                    {},
                                )}
                                subLabel={lang.format(
                                    "settings.auth.log_out.description",
                                    {},
                                )}
                                leading={
                                    <FormRow.Icon
                                        source={getAssetIDByName(
                                            "DoorExitIcon",
                                        )}
                                    />
                                }
                                destructive
                                onPress={() =>
                                    !isBusy.length &&
                                    showConfirmationAlert({
                                        title: lang.format(
                                            "alert.log_out.title",
                                            {},
                                        ),
                                        content: lang.format(
                                            "alert.log_out.body",
                                            {},
                                        ),
                                        onConfirm: () => {
                                            useCacheStore
                                                .getState()
                                                .updateData();
                                            useAuthorizationStore
                                                .getState()
                                                .setToken(undefined);

                                            showToast(
                                                lang.format("toast.logout", {}),
                                                getAssetIDByName(
                                                    "DoorExitIcon",
                                                ),
                                            );
                                        },
                                    })
                                }
                            />
                            <FormRow
                                label={lang.format(
                                    "settings.auth.delete_songs.title",
                                    {},
                                )}
                                subLabel={lang.format(
                                    "settings.auth.delete_songs.description",
                                    {},
                                )}
                                leading={
                                    isBusy.includes("delete_songs") ? (
                                        <RN.ActivityIndicator size="small" />
                                    ) : (
                                        <FormRow.Icon
                                            source={getAssetIDByName(
                                                "TrashIcon",
                                            )}
                                        />
                                    )
                                }
                                onPress={() =>
                                    !isBusy.length &&
                                    showConfirmationAlert({
                                        title: lang.format(
                                            "alert.delete_songs.title",
                                            {},
                                        ),
                                        content: lang.format(
                                            "alert.delete_songs.body",
                                            {},
                                        ),
                                        confirmText: lang.format(
                                            "alert.delete_songs.confirm",
                                            {},
                                        ),
                                        confirmColor: "red" as ButtonColors,
                                        onConfirm: async () => {
                                            setBusy("delete_songs");
                                            await deleteData();
                                            useAuthorizationStore
                                                .getState()
                                                .setToken(undefined);

                                            unBusy("delete_songs");
                                            showToast(
                                                lang.format(
                                                    "toast.deleted_songs",
                                                    {},
                                                ),
                                                getAssetIDByName("TrashIcon"),
                                            );
                                        },
                                    })
                                }
                            />
                        </>
                    ) : (
                        <FormRow
                            label={lang.format("settings.auth.authorize", {})}
                            leading={
                                <FormRow.Icon
                                    source={getAssetIDByName("LinkIcon")}
                                />
                            }
                            trailing={FormRow.Arrow}
                            onPress={openOauth2Modal}
                        />
                    )}
                </BetterTableRowGroup>
                <RN.View style={{ height: 12 }} />
            </RN.ScrollView>
        </ModifiedDataContext.Provider>
    );
}
