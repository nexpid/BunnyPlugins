import {
  NavigationNative,
  React,
  ReactNative as RN,
} from "@vendetta/metro/common";
import { showConfirmationAlert } from "@vendetta/ui/alerts";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { General, Search } from "@vendetta/ui/components";
import { showToast } from "@vendetta/ui/toasts";
import { safeFetch } from "@vendetta/utils";

import SuperAwesomeIcon from "$/components/SuperAwesomeIcon";
import { openSheet } from "$/types";

import { lang, pluginsURL } from "../..";
import { getChanges, updateChanges } from "../../stuff/pluginChecker";
import { emitterAvailable } from "../../stuff/util";
import { PluginsFullJson } from "../../types";
import PluginThing from "../PluginThing";
import ChooseSheet from "../sheets/ChooseSheet";

const { View } = General;

enum Sort {
  DateNewest = "sheet.sort.date_newest",
  DateOldest = "sheet.sort.date_oldest",
  NameAZ = "sheet.sort.name_az",
  NameZA = "sheet.sort.name_za",
}

let refreshCallback: () => void;
let sortCallback: () => void;
export default () => {
  const navigation = NavigationNative.useNavigation();

  if (!emitterAvailable) {
    showConfirmationAlert({
      title: lang.format("alert.unusable.title", {}),
      content: lang.format("alert.unusable.body", {}),
      confirmColor: "brand" as ButtonColors,
      onConfirm: () => {},
      isDismissable: true,
    });
    navigation.goBack();
    return null;
  }

  const [search, setSearch] = React.useState("");

  const changes = React.useRef(getChanges()).current;
  const [sort, setSort] = React.useState(Sort.DateNewest);
  const [parsed, setParsed] = React.useState<PluginsFullJson | null>(null);

  const currentSetSort = React.useRef(setSort);
  currentSetSort.current = setSort;

  const sortedData = React.useMemo(() => {
    if (!parsed) return;

    let dt = parsed
      .filter((i) =>
        [
          i.vendetta.original,
          i.name,
          i.description,
          i.authors?.map((x) => x.name),
        ]
          .flat()
          .some((x) => x?.toLowerCase().includes(search)),
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
              showToast(
                lang.format("toast.data.fail_parse", {}),
                getAssetIDByName("Small"),
              ),
            ),
        )
        .catch(() =>
          showToast(
            lang.format("toast.data.fail_fetch", {}),
            getAssetIDByName("Small"),
          ),
        );
  }, [parsed]);

  refreshCallback = () => parsed && setParsed(null);
  sortCallback = () =>
    parsed &&
    openSheet(ChooseSheet, {
      label: lang.format("sheet.sort.title", {}),
      value: lang.format(sort, {}),
      choices: Object.values(Sort).map((x) => lang.format(x, {})),
      update: (val) => currentSetSort.current(val as Sort),
    });

  navigation.addListener("focus", () => {
    navigation.setOptions({
      title: lang.format("plugin.name", {}),
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
          <Search onChangeText={setSearch} />
        </View>
      }
      style={{ paddingHorizontal: 10 }}
      contentContainerStyle={{ paddingBottom: 20 }}
      data={sortedData}
      renderItem={({ item, index }) => (
        <PluginThing
          index={index}
          highlight={search}
          item={item}
          changes={changes}
        />
      )}
      removeClippedSubviews={true}
    />
  );
};
