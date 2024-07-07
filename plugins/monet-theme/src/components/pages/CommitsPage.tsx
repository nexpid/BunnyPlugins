import { findByProps } from "@vendetta/metro";
import { ReactNative as RN, url } from "@vendetta/metro/common";
import { useProxy } from "@vendetta/storage";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { showToast } from "@vendetta/ui/toasts";

import { hideActionSheet } from "$/components/ActionSheet";
import { FlashList } from "$/deps";

import { vstorage } from "../..";
import Commit from "../Commit";
import { stsCommits } from "../Settings";

const { showSimpleActionSheet } = findByProps("showSimpleActionSheet");

export const CommitsPage = () => {
  useProxy(vstorage);

  return (
    <FlashList
      ItemSeparatorComponent={() => <RN.View style={{ height: 12 }} />}
      ListFooterComponent={<RN.View style={{ height: 20 }} />}
      data={stsCommits}
      estimatedItemSize={79}
      renderItem={({ item }) => (
        <Commit
          commit={item}
          onPress={() => url.openURL(item.html_url)}
          selected={vstorage.patches.commit === item.sha}
          onLongPress={() =>
            showSimpleActionSheet({
              key: "CardOverflow",
              header: {
                title: item.commit.message,
                onClose: () => hideActionSheet(),
              },
              options: [
                vstorage.patches.commit !== item.sha
                  ? {
                      label: "Use commit as patches",
                      onPress: () => {
                        showToast(
                          `Using commit ${item.sha.slice(0, 7)}`,
                          getAssetIDByName("ThreadIcon"),
                        );
                        vstorage.patches.commit = item.sha;
                      },
                    }
                  : {
                      label: "Don't use commit as patches",
                      isDestructive: true,
                      onPress: () => {
                        showToast(
                          "Using latest commit",
                          getAssetIDByName("ThreadPlusIcon"),
                        );
                        delete vstorage.patches.commit;
                      },
                    },
              ],
            })
          }
        />
      )}
      removeClippedSubviews
    />
  );
};

export function openCommitsPage(navigation: any) {
  navigation.push("VendettaCustomPage", {
    render: CommitsPage,
    title: "Commits",
  });
}
