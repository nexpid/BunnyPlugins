import {
  NavigationNative,
  ReactNative as RN,
  React,
} from "@vendetta/metro/common";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { PluginsFullJson } from "../types";
import { General, Search } from "@vendetta/ui/components";
import { pluginsURL } from "..";
import { showToast } from "@vendetta/ui/toasts";
import { findByProps } from "@vendetta/metro";
import { SuperAwesomeIcon } from "../../../../stuff/types";
import { safeFetch } from "@vendetta/utils";
import { getChanges, updateChanges } from "../stuff/pluginChecker";
import PluginThing from "./PluginThing";

const { showSimpleActionSheet } = findByProps("showSimpleActionSheet");

const { View } = General;

enum Filter {
  Newest = "Newest",
  Oldest = "Oldest",
  Alphabetical = "Alphabetical",
  ReverseAlphabetical = "Reverse Alphabetical",
}

let refreshCallback: () => void;
let filterCallback: () => void;
export default () => {
  const [changes] = React.useState(getChanges());
  const [filter, setFilter] = React.useState(Filter.Newest);
  const [parsed, setParsed] = React.useState<PluginsFullJson>();
  const [search, setSearch] = React.useState("");

  React.useEffect(() => {
    setSearch("");
    setFilter(Filter.Newest);
  }, []);

  React.useEffect(() => {
    updateChanges();
  }, []);

  const navigation = NavigationNative.useNavigation();

  React.useEffect(() => {
    if (!parsed)
      safeFetch(pluginsURL, {
        cache: "no-store",
      })
        .then((x) =>
          x
            .json()
            .then((x) => setParsed(x))
            .catch(() =>
              showToast("Failed to parse plugins", getAssetIDByName("Small"))
            )
        )
        .catch(() =>
          showToast("Failed to fetch plugins", getAssetIDByName("Small"))
        );
  }, [parsed]);

  refreshCallback = () => parsed && setParsed(undefined);
  filterCallback = () =>
    parsed &&
    showSimpleActionSheet({
      key: "CardOverflow",
      options: Object.values(Filter).map((x) => ({
        label: x,
        onPress: () => setFilter(x),
      })),
    });

  navigation.addListener("focus", () => {
    navigation.setOptions({
      title: "Plugin Browser",
      headerRight: () => (
        <View style={{ flexDirection: "row-reverse" }}>
          <SuperAwesomeIcon
            onPress={() => refreshCallback?.()}
            icon={getAssetIDByName("ic_sync_24px")}
            style="header"
          />
          <SuperAwesomeIcon
            onPress={() => filterCallback?.()}
            icon={getAssetIDByName("ic_filter")}
            style="header"
          />
        </View>
      ),
    });
  });

  if (!parsed)
    return <RN.ActivityIndicator size={"large"} style={{ flex: 1 }} />;

  let sortedData = parsed.filter(
    (i) =>
      i.name?.toLowerCase().includes(search) ||
      i.authors?.some((x) => x.name?.toLowerCase().includes(search)) ||
      i.description?.toLowerCase().includes(search)
  );

  if ([Filter.Alphabetical, Filter.ReverseAlphabetical].includes(filter))
    sortedData = sortedData.sort((a, b) =>
      a.name < b.name ? -1 : a.name > b.name ? 1 : 0
    );
  if ([Filter.ReverseAlphabetical, Filter.Newest].includes(filter))
    sortedData.reverse();

  return (
    <RN.FlatList
      ListHeaderComponent={
        <Search
          style={{ marginBottom: 10 }}
          onChangeText={(x) => setSearch(x.toLowerCase())}
        />
      }
      style={{ paddingHorizontal: 10, paddingTop: 10 }}
      contentContainerStyle={{ paddingBottom: 20 }}
      data={sortedData}
      renderItem={({ item, index }) => (
        <PluginThing item={item} index={index} changes={changes} />
      )}
      removeClippedSubviews={true}
    ></RN.FlatList>
  );
};
