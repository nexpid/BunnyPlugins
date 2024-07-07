import { i18n, ReactNative as RN, stylesheet } from "@vendetta/metro/common";
import { semanticColors } from "@vendetta/ui";

import Text from "$/components/Text";
import { Stack } from "$/lib/redesign";

export interface CommitUser {
  login: string;
  id: number;
  node_id: string;
  avatar_url: string;
  gravatar_id: string;
  url: string;
  html_url: string;
  followers_url: string;
  following_url: string;
  gists_url: string;
  starred_url: string;
  subscriptions_url: string;
  organizations_url: string;
  repos_url: string;
  events_url: string;
  received_events_url: string;
  type: string;
  site_admin: false;
}
export interface CommitObj {
  sha: string;
  node_id: string;
  commit: {
    author: {
      name: string;
      email: string;
      date: string;
    };
    commiter: {
      name: string;
      email: string;
      date: string;
    };
    message: string;
    tree: {
      sha: string;
      url: string;
    };
    url: string;
    comment_count: number;
    verification: {
      verified: boolean;
      reason: string;
      signature: any;
      payload: any;
    };
  };
  url: string;
  html_url: string;
  comments_url: string;
  author: CommitUser;
  committer: CommitUser;
  parents: {
    sha: string;
    url: string;
    html_url: string;
  }[];
}

export default function Commit({
  commit,
  selected,
  ...props
}: {
  commit: CommitObj;
  selected?: boolean;
} & import("react-native").PressableProps) {
  const styles = stylesheet.createThemedStyleSheet({
    androidRipple: {
      color: semanticColors.ANDROID_RIPPLE,
      cornerRadius: 16,
    } as any,
    card: {
      padding: 16,
      borderRadius: 16,
      borderColor: semanticColors.BORDER_FAINT,
      borderWidth: 1,
      backgroundColor: selected
        ? semanticColors.CARD_SECONDARY_BG
        : semanticColors.CARD_PRIMARY_BG,

      marginHorizontal: 16,
    },
    title: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    avatar: {
      width: 18,
      height: 18,
      borderRadius: 11,
    },
  });

  return (
    <RN.Pressable
      style={styles.card}
      android_ripple={styles.androidRipple}
      {...props}
    >
      <Stack spacing={6}>
        <RN.View style={styles.title}>
          <RN.Image
            style={styles.avatar}
            source={{ uri: commit.committer.avatar_url, cache: "force-cache" }}
            resizeMode="cover"
          />
          <Text variant="text-sm/medium" color="TEXT_NORMAL">
            {commit.committer.login}
          </Text>
          <Text
            variant="text-sm/medium"
            color="TEXT_MUTED"
            style={{ marginLeft: "auto" }}
          >
            {new Date(commit.commit.author.date).toLocaleDateString(
              i18n.getLocale(),
            )}
          </Text>
        </RN.View>
        <Text variant="text-md/normal" color="TEXT_NORMAL" lineClamp={1}>
          {commit.commit.message}
        </Text>
      </Stack>
    </RN.Pressable>
  );
}
