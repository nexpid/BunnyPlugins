import { findByProps } from "@vendetta/metro";
import {
  NavigationNative,
  stylesheet,
  React,
  ReactNative as RN,
} from "@vendetta/metro/common";
import { semanticColors } from "@vendetta/ui";
import { AppRichAsset, getApplicationAssets } from "../../stuff/api";
import { General, Search } from "@vendetta/ui/components";
import { richAssetListAppId, richAssetListCallback } from "../../stuff/prompts";
import { TextStyleSheet } from "../../../../../stuff/types";

const TabletManagerIdk = findByProps("isTablet");

const { View, Text, Image } = General;

const styles = stylesheet.createThemedStyleSheet({
  card: {
    backgroundColor: semanticColors.BACKGROUND_SECONDARY,
    marginHorizontal: 4,
    marginVertical: 4,
    borderRadius: 8,
    flex: 1,
  },
  cardHeader: {
    backgroundColor: semanticColors.BACKGROUND_TERTIARY,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 8,
    width: "100%",
  },
  cardHeaderText: {
    ...TextStyleSheet["text-sm/semibold"],
    color: semanticColors.TEXT_NORMAL,
  },
  cardImage: {
    width: "100%",
    flex: 1,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
});

export const RichAssetList = () => {
  const navigation = NavigationNative.useNavigation();
  const [search, setSearch] = React.useState("");
  const [data, setData] = React.useState<AppRichAsset[]>();

  React.useEffect(() => {
    setSearch("");
  });
  if (!data) getApplicationAssets(richAssetListAppId).then(setData);

  let wentBack = false;
  return data ? (
    <RN.FlatList
      ListEmptyComponent={
        <Search
          style={{ marginBottom: 10 }}
          onChangeText={(x: string) => setSearch(x.toLowerCase())}
        />
      }
      style={{ paddingHorizontal: 10, paddingTop: 10 }}
      contentContainerStyle={{ paddingBottom: 20 }}
      data={data.filter((x) => x.name.toLowerCase().includes(search))}
      numColumns={TabletManagerIdk.isTablet ? 3 : 2}
      renderItem={(x) => {
        const { item } = x;

        return (
          <RN.TouchableOpacity
            onPress={() => {
              if (wentBack) return;
              wentBack = true;
              navigation.goBack();
              richAssetListCallback?.(item.id);
            }}
            style={{
              width: `${TabletManagerIdk.isTablet ? 1 / 0.03 : 1 / 0.02}%`,
              aspectRatio: 1,
            }}
          >
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardHeaderText}>{item.name}</Text>
              </View>
              <Image
                source={{
                  uri: `https://cdn.discordapp.com/app-assets/${richAssetListAppId}/${item.id}.png?size=128`,
                }}
              />
            </View>
          </RN.TouchableOpacity>
        );
      }}
    />
  ) : (
    <RN.ActivityIndicator style={{ flex: 1 }} />
  );
};

export function showRichAssetList(navigation) {
  navigation.push("VendettaCustomPage", {
    render: RichAssetList,
    title: "Select Asset",
  });
}
