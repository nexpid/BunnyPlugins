import { General } from "@vendetta/ui/components";
import Commit from "../Commit";
import { ReactNative as RN, stylesheet, url } from "@vendetta/metro/common";
import { stsCommits } from "../Settings";
import { semanticColors } from "@vendetta/ui";

const { ScrollView, View } = General;

export const CommitsPage = () => {
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
