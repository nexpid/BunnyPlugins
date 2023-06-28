import {
  NavigationNative,
  ReactNative as RN,
  React,
} from "@vendetta/metro/common";
import { SuperAwesomeIcon } from "../../../../stuff/types";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { showConfirmationAlert } from "@vendetta/ui/alerts";
import { useProxy } from "@vendetta/storage";
import { vstorage } from "..";
import { Forms, Search, Summary } from "@vendetta/ui/components";
import { plugins } from "@vendetta";

const { FormSwitchRow } = Forms;

export default (): React.JSX.Element => {
  const [search, setSearch] = React.useState("");
  const [, forceUpdate] = React.useReducer((x) => ~x, 0);

  React.useEffect(() => {
    setSearch("");
  }, []);

  useProxy(vstorage);
  const navigation = NavigationNative.useNavigation();

  navigation.setOptions({
    title: "Plugin Settings",
    headerRight: () => (
      <SuperAwesomeIcon
        onPress={() =>
          showConfirmationAlert({
            title: "Revert Settings",
            content: "Would you like to revert all plugin settings?",
            confirmText: "Revert",
            cancelText: "Cancel",
            confirmColor: "red" as ButtonColors,
            onConfirm: () => (vstorage.pluginSettings = {}),
          })
        }
        icon={getAssetIDByName("ic_message_delete")}
        style="header"
      />
    ),
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
      data={Object.entries(plugins.plugins).filter((x) =>
        x[1].manifest.name?.toLowerCase().includes(search)
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
              label="Sync Plugin"
              onValueChange={() => {
                config.syncPlugin = !config.syncPlugin;
                updateConfig();
              }}
              value={config.syncPlugin}
            />
            <FormSwitchRow
              label="Sync Plugin Storage"
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
