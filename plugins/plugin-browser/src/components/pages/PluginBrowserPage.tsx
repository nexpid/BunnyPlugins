import {
  NavigationNative,
  React,
  ReactNative as RN,
} from "@vendetta/metro/common";
import { showConfirmationAlert } from "@vendetta/ui/alerts";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { General } from "@vendetta/ui/components";
import { showToast } from "@vendetta/ui/toasts";
import { safeFetch } from "@vendetta/utils";

import RedesignSearch, {
  useRedesignSearch,
} from "$/components/compat/RedesignSearch";
import SuperAwesomeIcon from "$/components/SuperAwesomeIcon";
import { openSheet } from "$/types";

import { pluginsURL } from "../..";
import { getChanges, updateChanges } from "../../stuff/pluginChecker";
import { emitterAvailable } from "../../stuff/util";
import { PluginsFullJson } from "../../types";
import PluginThing from "../PluginThing";
import ChooseSheet from "../sheets/ChooseSheet";

const { View } = General;

enum Sort {
  DateNewest = "Creation date (new to old)",
  DateOldest = "Creation date (old to new)",
  NameAZ = "Name (A-Z)",
  NameZA = "Name (Z-A)",
}

let refreshCallback: () => void;
let sortCallback: () => void;
export default () => {
  const navigation = NavigationNative.useNavigation();

  if (!emitterAvailable) {
    showConfirmationAlert({
      title: "Can't use",
      content:
        "You must reinstall Vendetta first in order for Plugin Browser to function properly",
      confirmText: "Dismiss",
      confirmColor: "brand" as ButtonColors,
      onConfirm: () => {},
      isDismissable: true,
    });
    navigation.goBack();
    return null;
  }

  const [search, controller] = useRedesignSearch();

  const changes = React.useRef(getChanges()).current;
  const [sort, setSort] = React.useState(Sort.DateNewest);
  const [parsed, setParsed] = React.useState<PluginsFullJson | null>(null);

  const currentSetSort = React.useRef(setSort);
  currentSetSort.current = setSort;

  const sortedData = React.useMemo(() => {
    if (!parsed) return;

    let dt = parsed
      .filter(
        (i) =>
          i.name?.toLowerCase().includes(search) ||
          i.authors?.some((x) => x.name?.toLowerCase().includes(search)) ||
          i.description?.toLowerCase().includes(search),
      )
      .slice();
    if ([Sort.NameAZ, Sort.NameZA].includes(sort))
      dt = dt.sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
    if ([Sort.NameZA, Sort.DateNewest].includes(sort)) dt.reverse();

    return dt;
  }, [sort, parsed, search]);

  React.useEffect(updateChanges, []);

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
              showToast("Failed to parse plugins", getAssetIDByName("Small")),
            ),
        )
        .catch(() =>
          showToast("Failed to fetch plugins", getAssetIDByName("Small")),
        );
  }, [parsed]);

  refreshCallback = () => parsed && setParsed(null);
  sortCallback = () =>
    parsed &&
    openSheet(ChooseSheet, {
      label: "Sorting",
      value: sort,
      choices: Object.values(Sort),
      update: (val) => currentSetSort.current(val as Sort),
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
            onPress={() => sortCallback?.()}
            icon={getAssetIDByName("ic_filter")}
            style="header"
          />
        </View>
      ),
    });
  });

  if (!parsed)
    return <RN.ActivityIndicator size={"large"} style={{ flex: 1 }} />;

  return (
    <RN.FlatList
      ListHeaderComponent={
        <View style={{ marginBottom: 10 }}>
          <RedesignSearch controller={controller} />
        </View>
      }
      style={{ paddingHorizontal: 10 }}
      contentContainerStyle={{ paddingBottom: 20 }}
      data={sortedData}
      renderItem={({ item }) => <PluginThing item={item} changes={changes} />}
      removeClippedSubviews={true}
    />
  );
};
