import {
  NavigationNative,
  React,
  ReactNative as RN,
} from "@vendetta/metro/common";
import { SimpleAPIApplication, getApplications } from "../../stuff/api";
import { General, Search } from "@vendetta/ui/components";
import { SimpleText } from "../../../../../stuff/types";
import { placeholders } from "../Settings";
import { applicationListCallback } from "../../stuff/prompts";

const { View, Image } = General;

export const ApplicationList = (): React.JSX.Element => {
  const navigation = NavigationNative.useNavigation();
  const [search, setSearch] = React.useState("");
  const [data, setData] = React.useState<SimpleAPIApplication[]>();

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
        x.name.toLowerCase().includes(search.toLowerCase())
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
                <SimpleText variant="text-md/semibold" color="TEXT_NORMAL">
                  {item.name}
                </SimpleText>
                <SimpleText
                  variant="text-sm/medium"
                  color="TEXT_MUTED"
                  lineClamp={1}
                >
                  {item.description}
                </SimpleText>
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
  });
}
