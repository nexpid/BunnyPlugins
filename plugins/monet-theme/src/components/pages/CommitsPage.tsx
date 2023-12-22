import { findByProps } from "@vendetta/metro";
import { ReactNative as RN, stylesheet, url } from "@vendetta/metro/common";
import { useProxy } from "@vendetta/storage";
import { semanticColors } from "@vendetta/ui";
import { General } from "@vendetta/ui/components";
import { showToast } from "@vendetta/ui/toasts";

import { LazyActionSheet } from "../../../../../stuff/types";
import { vstorage } from "../..";
import Commit from "../Commit";
import { stsCommits } from "../Settings";

const { showSimpleActionSheet } = findByProps("showSimpleActionSheet");
const { ScrollView, View } = General;

export const CommitsPage = () => {
  useProxy(vstorage);

  const styles = stylesheet.createThemedStyleSheet({
    window: {
      height: "100%",
      backgroundColor: semanticColors.BG_BASE_SECONDARY,
    },
  });

  return (
    <ScrollView style={styles.window}>
      {stsCommits ? (
        <>
          {stsCommits.map((x) => (
            <Commit
              commit={x}
              list={true}
              onPress={() => url.openURL(x.html_url)}
              highlight={vstorage.patches.commit === x.sha}
              onLongPress={() =>
                showSimpleActionSheet({
                  key: "CardOverflow",
                  header: {
                    title: x.commit.message,
                    onClose: () => LazyActionSheet.hideActionSheet(),
                  },
                  options: [
                    vstorage.patches.commit !== x.sha
                      ? {
                          label: "Use commit as patches",
                          onPress: () => {
                            showToast(`Using commit ${x.sha.slice(0, 7)}`);
                            vstorage.patches.commit = x.sha;
                          },
                        }
                      : {
                          label: "Don't use commit as patches",
                          isDestructive: true,
                          onPress: () => {
                            showToast("Using latest commit");
                            delete vstorage.patches.commit;
                          },
                        },
                  ],
                })
              }
            />
          ))}
          <View style={{ height: 12 }} />
        </>
      ) : (
        <RN.ActivityIndicator style={{ flex: 1 }}></RN.ActivityIndicator>
      )}
    </ScrollView>
  );
};

export function openCommitsPage(navigation: any) {
  navigation.push("VendettaCustomPage", {
    render: CommitsPage,
    title: "Commits",
  });
}
