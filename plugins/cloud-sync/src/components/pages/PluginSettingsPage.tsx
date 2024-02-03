import {
  NavigationNative,
  React,
  ReactNative as RN,
} from "@vendetta/metro/common";
import { plugins } from "@vendetta/plugins";
import { useProxy } from "@vendetta/storage";
import { showConfirmationAlert } from "@vendetta/ui/alerts";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { Forms, Search, Summary } from "@vendetta/ui/components";

import SuperAwesomeIcon from "$/components/SuperAwesomeIcon";

import { lang, vstorage } from "../..";

const { FormSwitchRow } = Forms;

export default () => {
  const [search, setSearch] = React.useState("");
  const [, forceUpdate] = React.useReducer((x) => ~x, 0);

  React.useEffect(() => {
    setSearch("");
  }, []);

  useProxy(vstorage);
  const navigation = NavigationNative.useNavigation();

  const unsub = navigation.addListener("focus", () => {
    unsub();
    navigation.setOptions({
      title: lang.format("page.plugin_settings.title", {}),
      headerRight: () => (
        <SuperAwesomeIcon
          onPress={() =>
            showConfirmationAlert({
              title: lang.format("alert.plugin_settings_revert.title", {}),
              content: lang.format("alert.plugin_settings_revert.body", {}),
              confirmText: lang.format(
                "alert.plugin_settings_revert.confirm",
                {},
              ),
              confirmColor: "red" as ButtonColors,
              onConfirm: () => (vstorage.pluginSettings = {}),
            })
          }
          icon={getAssetIDByName("ic_message_delete")}
          style="header"
        />
      ),
    });
  });

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
      data={Object.entries(plugins).filter((x) =>
        x[1].manifest.name?.toLowerCase().includes(search),
      )}
      renderItem={({ item: [id, item] }) => {
        const config = vstorage.pluginSettings[id] ?? {
          syncPlugin: true,
          syncStorage: true,
        };
        const updateConfig = () => {
          if (config.syncPlugin === true && config.syncStorage === true)
            delete vstorage.pluginSettings[id];
          else vstorage.pluginSettings[id] = config;

          forceUpdate(); // TODO get rid of this if possible
        };

        return (
          <Summary
            label={item.manifest.name}
            icon={item.manifest.vendetta.icon ?? ":3"}
          >
            <FormSwitchRow
              label={lang.format("page.plugin_settings.sync_plugin", {})}
              onValueChange={() => {
                config.syncPlugin = !config.syncPlugin;
                updateConfig();
              }}
              value={config.syncPlugin}
            />
            <FormSwitchRow
              label={lang.format(
                "page.plugin_settings.sync_plugin_storage",
                {},
              )}
              onValueChange={() => {
                config.syncStorage = !config.syncStorage;
                updateConfig();
              }}
              value={config.syncStorage}
            />
          </Summary>
        );
      }}
    />
  );
};
