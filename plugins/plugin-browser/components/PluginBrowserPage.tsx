import {
  NavigationNative,
  ReactNative as RN,
  constants,
  stylesheet,
} from "@vendetta/metro/common";
import SuperAwesomeIcon from "./SuperAwesomeIcon";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { PluginsFullJson } from "../src/types";
import { safeFetch } from "@vendetta/utils";
import { General, Search } from "@vendetta/ui/components";
import ScuffedPluginCard from "./ScuffedPluginCard";
import { plugins } from "@vendetta";
import { installPlugin, removePlugin } from "@vendetta/plugins";
import { openProfile, refetchPlugin } from "../src";
import { showToast } from "@vendetta/ui/toasts";
import { semanticColors } from "@vendetta/ui";
import { findByProps } from "@vendetta/metro";

const { TextStyleSheet } = findByProps("TextStyleSheet");
const styles = stylesheet.createThemedStyleSheet({
  text: {
    ...TextStyleSheet["text-md/medium"],
    color: semanticColors.TEXT_NORMAL,
  },
  link: {
    ...TextStyleSheet["text-md/bold"],
    color: semanticColors.TEXT_LINK,
  },
});

const { Text } = General;

export default () => {
  const busyPlugins = {};
  //@ts-ignore react is a UMD global 🤓
  const [isBusy, setIsBusy] = React.useState(false);
  //@ts-ignore react is a UMD global 🤓
  const [data, setData] = React.useState<{ parsed?: PluginsFullJson }>({});
  //@ts-ignore react is a UMD global 🤓
  const [search, setSearch] = React.useState("");

  //@ts-ignore react is a UMD global 🤓
  React.useEffect(() => {
    setSearch("");
  }, []);

  const navigation = NavigationNative.useNavigation();

  if (!data.parsed && !isBusy) {
    setIsBusy(true);
    safeFetch("https://vd-plugins.github.io/proxy/plugins-full.json", {
      cache: "no-store",
    })
      .then((x) => x.json())
      .then((x) => {
        setData({
          parsed: x.reverse(),
        });
        setIsBusy(false);
      });
  }

  navigation.setOptions({
    title: "Plugin Browser",
    headerRight: SuperAwesomeIcon({
      onPress: () => !isBusy && setData({ parsed: undefined }),
      icon: getAssetIDByName("ic_sync_24px"),
      style: "header",
    }),
  });

  return isBusy || !data.parsed ? (
    <RN.ActivityIndicator size={"large"} style={{ flex: 1 }} />
  ) : (
    <RN.FlatList
      ListHeaderComponent={
        <Search
          style={{ marginBottom: 10 }}
          onChangeText={(x) => setSearch(x.toLowerCase())}
        />
      }
      style={{ paddingHorizontal: 10, paddingTop: 10 }}
      contentContainerStyle={{ paddingBottom: 20 }}
      data={data.parsed.filter(
        (i) =>
          i.name?.toLowerCase().includes(search) ||
          i.authors?.some((x) => x.name?.toLowerCase().includes(search)) ||
          i.description?.toLowerCase().includes(search)
      )}
      renderItem={({ item, index }) => {
        return (
          <ScuffedPluginCard
            index={index}
            headerLabel={
              <Text style={styles.text}>
                {item.name}
                {item.authors[0] && " by "}
                {...item.authors.map((x, i, a) => (
                  <>
                    <Text onPress={() => openProfile(x.id)} style={styles.link}>
                      {x.name}
                    </Text>
                    {i !== a.length - 1 && ", "}
                  </>
                ))}
              </Text>
            }
            headerIcon={getAssetIDByName(item.vendetta.icon)}
            descriptionLabel={item.description}
            actions={() => {
              const proxiedLink = `https://vd-plugins.github.io/proxy/${item.vendetta.original}`;
              const hasPlugin = plugins.plugins[proxiedLink];

              return hasPlugin
                ? [
                    hasPlugin.manifest.hash !== item.hash && {
                      icon: getAssetIDByName("ic_sync_24px"),
                      onPress: async (rerender) => {
                        if (busyPlugins[proxiedLink]) return;
                        busyPlugins[proxiedLink] = true;

                        try {
                          await refetchPlugin(proxiedLink);
                          showToast(
                            `Successfully updated ${item.name}.`,
                            getAssetIDByName("ic_sync_24px")
                          );
                        } catch {
                          showToast(
                            `Failed to update ${item.name}!`,
                            getAssetIDByName("Small")
                          );
                        }

                        delete busyPlugins[proxiedLink];
                        rerender();
                      },
                    },
                    {
                      icon: getAssetIDByName("ic_message_delete"),
                      destructive: true,
                      onPress: async (rerender) => {
                        if (busyPlugins[proxiedLink]) return;
                        busyPlugins[proxiedLink] = true;

                        try {
                          removePlugin(proxiedLink);
                          showToast(
                            `Successfully deleted ${item.name}.`,
                            getAssetIDByName("ic_message_delete")
                          );
                        } catch {
                          showToast(
                            `Failed to delete ${item.name}!`,
                            getAssetIDByName("Small")
                          );
                        }

                        delete busyPlugins[proxiedLink];
                        rerender();
                      },
                    },
                  ].filter((x) => !!x)
                : [
                    {
                      icon: getAssetIDByName("ic_download_24px"),
                      onPress: async (rerender) => {
                        if (busyPlugins[proxiedLink]) return;
                        busyPlugins[proxiedLink] = true;

                        try {
                          await installPlugin(proxiedLink);
                          showToast(
                            `Successfully installed ${item.name}.`,
                            getAssetIDByName("toast_image_saved")
                          );
                        } catch (e: any) {
                          showToast(
                            e?.message ?? `Failed to install ${item.name}!`,
                            getAssetIDByName("Small")
                          );
                        }

                        delete busyPlugins[proxiedLink];
                        rerender();
                      },
                    },
                  ];
            }}
          />
        );
      }}
    ></RN.FlatList>
  );
};
