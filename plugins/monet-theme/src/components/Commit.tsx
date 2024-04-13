import {
  constants,
  ReactNative as RN,
  stylesheet,
} from "@vendetta/metro/common";
import { semanticColors } from "@vendetta/ui";
import { General } from "@vendetta/ui/components";

import Text from "$/components/Text";
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

const { View, Pressable } = General;

export default ({
  commit,
  list,
  highlight,
  onPress,
  onLongPress,
}: {
  commit: CommitObj;
  list?: boolean;
  highlight?: boolean;
  onPress?: () => void;
  onLongPress?: () => void;
}) => {
  const styles = stylesheet.createThemedStyleSheet({
    androidRipple: {
      color: semanticColors.ANDROID_RIPPLE,
      cornerRadius: 8,
    },
    container: {
      backgroundColor: semanticColors.BG_MOD_FAINT,
      flexDirection: "column",
      borderRadius: 8,
    },
    containerHighlight: {
      backgroundColor: semanticColors.BG_MOD_STRONG,
    },
  });

  const UseComponent = onPress || onLongPress ? Pressable : View;

  return (
    <View
      style={
        list
          ? { paddingHorizontal: 12, paddingTop: 12 }
          : { paddingHorizontal: 16, paddingTop: 16 }
      }
    >
      <UseComponent
        android_ripple={styles.androidRipple}
        disabled={false}
        accessibilityRole={"button"}
        accessibilityState={{
          disabled: false,
          expanded: false,
        }}
        accessibilityLabel="Commit"
        onPress={() => onPress?.()}
        onLongPress={() => onLongPress?.()}
        style={[styles.container, highlight && styles.containerHighlight]}
      >
        <View style={{ marginHorizontal: 12, marginVertical: 12 }}>
          <View style={{ flexDirection: "row", marginBottom: 4 }}>
            <RN.Image
              style={{
                width: 20,
                height: 20,
                borderRadius: 2147483647,
                marginRight: 8,
              }}
              source={{ uri: commit.committer.avatar_url }}
            />
            <Text
              style={{ marginRight: 8 }}
              variant="text-sm/semibold"
              color="TEXT_NORMAL"
            >
              {commit.committer.login}
            </Text>
            <Text
              style={{ marginRight: 8 }}
              variant="text-sm/semibold"
              color="TEXT_NORMAL"
            >
              •
            </Text>
            <Text
              color="TEXT_NORMAL"
              style={{
                fontFamily:
                  constants.Fonts.CODE_SEMIBOLD || constants.Fonts.CODE_NORMAL,
              }}
            >
              {commit.sha.slice(0, 7)}
            </Text>
          </View>
          <Text variant="text-md/semibold" color="TEXT_NORMAL">
            {commit.commit.message}
          </Text>
        </View>
      </UseComponent>
    </View>
  );
};
