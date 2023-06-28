import {
  NavigationNative,
  ReactNative as RN,
  React,
  stylesheet,
} from "@vendetta/metro/common";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { PluginsFullJson } from "../types";
import { safeFetch } from "@vendetta/utils";
import { General, Search } from "@vendetta/ui/components";
import ScuffedPluginCard from "./ScuffedPluginCard";
import { plugins } from "@vendetta";
import { installPlugin, removePlugin } from "@vendetta/plugins";
import { openProfile, refetchPlugin } from "..";
import { showToast } from "@vendetta/ui/toasts";
import { semanticColors } from "@vendetta/ui";
import { findByProps } from "@vendetta/metro";
import { SuperAwesomeIcon } from "../../../../stuff/types";

const { showSimpleActionSheet } = findByProps("showSimpleActionSheet");
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

const { Text, View } = General;

enum Filter {
  Newest = "Newest",
  Oldest = "Oldest",
  Alphabetical = "Alphabetical",
  ReverseAlphabetical = "Reverse Alphabetical",
}

export default () => {
  const busyPlugins = {};
  const [isBusy, setIsBusy] = React.useState(false);
  const [filter, setFilter] = React.useState(Filter.Newest);
  const [data, setData] = React.useState<{ parsed?: PluginsFullJson }>({});
  const [search, setSearch] = React.useState("");

  React.useEffect(() => {
    setSearch("");
    setFilter(Filter.Newest);
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
          parsed: x,
        });
        setIsBusy(false);
      });
  }

  navigation.setOptions({
    title: "Plugin Browser",
    headerRight: () => (
      <View style={{ flexDirection: "row-reverse" }}>
        <SuperAwesomeIcon
          onPress={() => !isBusy && setData({ parsed: undefined })}
          icon={getAssetIDByName("ic_sync_24px")}
          style="header"
        />
        <SuperAwesomeIcon
          onPress={() =>
            !isBusy &&
            showSimpleActionSheet({
              key: "CardOverflow",
              options: Object.values(Filter).map((x) => ({
                label: x,
                onPress: () => setFilter(x),
              })),
            })
          }
          icon={getAssetIDByName("ic_filter")}
          style="header"
        />
      </View>
    ),
  });

  if (isBusy || !data.parsed)
    return <RN.ActivityIndicator size={"large"} style={{ flex: 1 }} />;

  let sortedData = data.parsed.filter(
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
