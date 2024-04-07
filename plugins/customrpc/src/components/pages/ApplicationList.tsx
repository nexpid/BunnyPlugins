import {
  NavigationNative,
  React,
  ReactNative as RN,
} from "@vendetta/metro/common";
import { showInputAlert } from "@vendetta/ui/alerts";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { General, Search } from "@vendetta/ui/components";
import { showToast } from "@vendetta/ui/toasts";

import SuperAwesomeIcon from "$/components/SuperAwesomeIcon";
import Text from "$/components/Text";

import { getApplications, SimpleAPIApplication } from "../../stuff/api";
import { applicationListCallback } from "../../stuff/prompts";
import { placeholders } from "../Settings";

const { View, Image } = General;

let headerRightCallback: () => void;
export const ApplicationList = () => {
  const navigation = NavigationNative.useNavigation();
  const [search, setSearch] = React.useState("");
  const [data, setData] = React.useState<SimpleAPIApplication[]>();

  headerRightCallback = () =>
    !wentBack &&
    showInputAlert({
      title: "Custom App ID",
      placeholder: "123",
      confirmText: "Use",
      confirmColor: "blue" as ButtonColors,
      onConfirm: (txt) => {
        if (txt.match(/^\s*$/))
          return showToast("App ID cannot be empty", getAssetIDByName("Small"));
        if (Number.isNaN(Number(txt)))
          return showToast("Invalid app ID", getAssetIDByName("Small"));

        applicationListCallback({
          id: txt,
        });
      },
      cancelText: "Cancel",
    });

  React.useEffect(() => {
    setSearch("");
  }, []);

  if (!data) getApplications().then(setData);

  let wentBack = false;
  return data ? (
    <RN.FlatList
      ListHeaderComponent={
        <Search
          style={{ marginBottom: 10 }}
          onChangeText={(x: string) => setSearch(x.toLowerCase())}
        />
      }
      style={{ paddingHorizontal: 10, paddingTop: 10 }}
      contentContainerStyle={{ paddingBottom: 20 }}
      data={data.filter((x) =>
        x.name.toLowerCase().includes(search.toLowerCase()),
      )}
      renderItem={(x) => {
        const { item } = x;

        return (
          <RN.TouchableOpacity
            onPress={() => {
              if (wentBack) return;
              wentBack = true;
              navigation.goBack();
              applicationListCallback?.({ id: item.id, name: item.name });
            }}
          >
            <View
              style={{
                marginHorizontal: 8,
                marginBottom: 8,
                flexDirection: "row",
              }}
            >
              <Image
                source={{
                  uri: item.icon
                    ? `https://cdn.discordapp.com/app-icons/${item.icon}/${item.icon}.png?size=64`
                    : placeholders.image,
                }}
                style={{
                  borderRadius: 8,
                  resizeMode: "cover",
                  aspectRatio: 1,
                }}
              />
              <View style={{ flexDirection: "column", marginLeft: 8 }}>
                <Text variant="text-md/semibold" color="TEXT_NORMAL">
                  {item.name}
                </Text>
                <Text variant="text-sm/medium" color="TEXT_MUTED" lineClamp={1}>
                  {item.description}
                </Text>
              </View>
            </View>
          </RN.TouchableOpacity>
        );
      }}
    />
  ) : (
    <RN.ActivityIndicator style={{ flex: 1 }} />
  );
};

export function showApplicationList(navigation) {
  navigation.push("VendettaCustomPage", {
    render: ApplicationList,
    title: "Select Application",
    headerRight: () => (
      <SuperAwesomeIcon
        style="header"
        icon={getAssetIDByName("ic_custom_color")}
        onPress={() => headerRightCallback?.()}
      />
    ),
  });
}
