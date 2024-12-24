import { logger } from "@vendetta";
import { findByName, findByProps, findByStoreName } from "@vendetta/metro";
import { React, ReactNative as RN, stylesheet } from "@vendetta/metro/common";
import { semanticColors } from "@vendetta/ui";
import { showToast } from "@vendetta/ui/toasts";
import { type ViewProps } from "react-native";

import { FlashList } from "$/deps";

import { lang } from "..";
import { useCacheStore } from "../stores/CacheStore";
import { getData, listData } from "../stuff/api";
import { UserData } from "../types";
import ProfileSong from "./songs/ProfileSong";

const { TableRowGroupTitle } = findByProps("TableRowGroup", "TableRow");

const { YouScreenProfileCard } = findByProps("YouScreenProfileCard");
const SimplifiedUserProfileCard = findByName("SimplifiedUserProfileCard");
const UserProfileSection = findByName("UserProfileSection");
const UserStore = findByStoreName("UserStore");
const { useThemeContext } = findByProps("useThemeContext");

export default function ProfileSongs({
    userId,
    variant,
    customBorder,
    style,
}: {
    userId: string;
    variant?: "you" | "simplified" | "classic";
    customBorder?: string;
    style?: ViewProps["style"];
}) {
    const styles = stylesheet.createThemedStyleSheet({
        card: {
            backgroundColor: semanticColors.CARD_PRIMARY_BG,
            minHeight: 200,
        },
    });

    const { data: ownData } = useCacheStore();
    const [data, setData] = React.useState<UserData | undefined>(undefined);
    const themeContext = useThemeContext();

    React.useEffect(() => {
        if (userId === UserStore.getCurrentUser()?.id) {
            setData(ownData);
            if (!ownData) getData();
            return;
        }
    }, [ownData, userId]);

    React.useEffect(() => {
        if (userId === UserStore.getCurrentUser()?.id) return;
        setData(undefined);

        listData(userId)
            .then(dt => setData(dt))
            .catch(e => {
                logger.error(
                    "ProfileSongs",
                    `failed while checking ${userId} (${variant} variant)`,
                    e,
                );
                showToast(":(");
            });
    }, [userId]);

    const [currentlyPlaying, setCurrentlyPlaying] = React.useState<
        string | null
    >(null);

    if (!data?.length) return null;

    const songs = (
        <FlashList
            ItemSeparatorComponent={() => <RN.View style={{ height: 8 }} />}
            data={data}
            extraData={[currentlyPlaying]}
            renderItem={({ item }) => (
                <ProfileSong
                    song={item}
                    themed={!!style || !!themeContext.primaryColor}
                    customBorder={customBorder}
                    playing={{ currentlyPlaying, setCurrentlyPlaying }}
                />
            )}
            keyExtractor={item => item.service + item.type + item.id}
            scrollEnabled={false}
            estimatedItemSize={167} // average of 92 (single) and 241.6 (entries)
        />
    );

    return variant === "you" ? (
        <YouScreenProfileCard style={{ minHeight: 200 }}>
            <TableRowGroupTitle title={lang.format("plugin.name", {})} />
            {songs}
        </YouScreenProfileCard>
    ) : variant === "simplified" ? (
        <SimplifiedUserProfileCard
            title={lang.format("plugin.name", {})}
            style={[styles.card, style]}>
            {songs}
        </SimplifiedUserProfileCard>
    ) : (
        <UserProfileSection
            title={lang.format("plugin.name", {})}
            style={{ minHeight: 200 }}>
            {songs}
        </UserProfileSection>
    );
}
