import { logger } from "@vendetta";
import { findByName, findByProps } from "@vendetta/metro";
import { React, ReactNative as RN, stylesheet } from "@vendetta/metro/common";
import { semanticColors } from "@vendetta/ui";
import { showToast } from "@vendetta/ui/toasts";
import { type ViewProps } from "react-native";

import { FlashList } from "$/deps";

import { lang } from "..";
import { listData } from "../stuff/api";
import { UserData } from "../types";
import ProfileSong from "./songs/ProfileSong";

const { TableRowGroupTitle } = findByProps("TableRowGroup", "TableRow");

const { YouScreenProfileCard } = findByProps("YouScreenProfileCard");
const SimplifiedUserProfileCard = findByName("SimplifiedUserProfileCard");
const UserProfileSection = findByName("UserProfileSection");
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
        },
    });

    const [data, setData] = React.useState<UserData | undefined>(undefined);
    const themeContext = useThemeContext();

    React.useEffect(() => {
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

    if (!data?.length) return null;

    const songs = (
        <FlashList
            ItemSeparatorComponent={() => <RN.View style={{ height: 8 }} />}
            data={data}
            renderItem={({ item, index }) => (
                <ProfileSong
                    song={item}
                    themed={!!style || !!themeContext.primaryColor}
                    customBorder={customBorder}
                    key={index}
                />
            )}
        />
    );

    return variant === "you" ? (
        <YouScreenProfileCard>
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
        <UserProfileSection title={lang.format("plugin.name", {})}>
            {songs}
        </UserProfileSection>
    );
}
