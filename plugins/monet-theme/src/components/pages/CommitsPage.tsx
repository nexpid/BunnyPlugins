import { General } from "@vendetta/ui/components";
import Commit from "../Commit";
import { ReactNative as RN, url } from "@vendetta/metro/common";
import { stsCommits } from "../Settings";

const { ScrollView } = General;

export const CommitsPage = () => {
  if (!stsCommits)
    return <RN.ActivityIndicator style={{ flex: 1 }}></RN.ActivityIndicator>;

  return (
    <ScrollView>
      {stsCommits.map((x) => (
        <Commit
          commit={x}
          list={true}
          onPress={() => url.openURL(x.html_url)}
        />
      ))}
    </ScrollView>
  );
};

export function openCommitsPage(navigation: any) {
  navigation.push("VendettaCustomPage", {
    render: CommitsPage,
    title: "Commits",
  });
}
