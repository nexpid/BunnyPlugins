import { logger } from "@vendetta";
import { findByName, findByProps } from "@vendetta/metro";
import { React, stylesheet } from "@vendetta/metro/common";
import { semanticColors } from "@vendetta/ui";
import { showToast } from "@vendetta/ui/toasts";

import { lang } from "..";
import { listData } from "../stuff/api";
import { UserData } from "../types";
import ProfileSong from "./songs/ProfileSong";

const { TableRowGroupTitle } = findByProps("TableRowGroup", "TableRow");

const { YouScreenProfileCard } = findByProps("YouScreenProfileCard");
const SimplifiedUserProfileCard = findByName("SimplifiedUserProfileCard");
const UserProfileSection = findByName("UserProfileSection");

export default function ProfileSongs({
    userId,
    style,
}: {
    userId: string;
    style?: "you" | "simplified" | "classic";
}) {
    const styles = stylesheet.createThemedStyleSheet({
        card: {
            backgroundColor: semanticColors.CARD_PRIMARY_BG,
        },
    });

    const [data, setData] = React.useState<UserData | undefined>(undefined);

    React.useEffect(() => {
        setData(undefined);

        listData(userId)
            .then(dt => setData(dt))
            .catch(e => {
                logger.error(
                    "ProfileSongs",
                    `failed while checking ${userId} (${style} style)`,
                    e,
                );
                showToast(":(");
            });
    }, [userId]);

    if (!data?.length) return null;

    const songs = data.map(song => <ProfileSong song={song} />);

    return style === "you" ? (
        <YouScreenProfileCard>
            <TableRowGroupTitle title={lang.format("plugin.name", {})} />
            {songs}
        </YouScreenProfileCard>
    ) : style === "simplified" ? (
        // FIXME colors!
        <SimplifiedUserProfileCard
            title={lang.format("plugin.name", {})}
            style={styles.card}>
            {songs}
        </SimplifiedUserProfileCard>
    ) : (
        <UserProfileSection title={lang.format("plugin.name", {})}>
            {songs}
        </UserProfileSection>
    );
}
