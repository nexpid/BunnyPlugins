import {
  stylesheet,
  React,
  ReactNative as RN,
  i18n,
  NavigationNative,
} from "@vendetta/metro/common";
import { semanticColors } from "@vendetta/ui";
import { General, Search } from "@vendetta/ui/components";
import { SimpleText } from "../../../../../stuff/types";
import { getAssetIDByName } from "@vendetta/ui/assets";
import useAsync from "../hooks/useAsync";
import {
  APICollectionItem,
  APICollectionType,
  getAppDirectoryCategories,
  getAppDirectoryCollections,
} from "../../stuff/api";
import { getAppInfoPageRender } from "./AppInfoPage";
import { inServers } from "../../stuff/util";
import { showToast } from "@vendetta/ui/toasts";

const { ScrollView, View } = General;

export default function AppDirectoryPage({
  guildId,
  pushScreen,
}: {
  guildId?: string;
  pushScreen?: any;
}) {
  const locale = i18n.getLocale();

  const categories = useAsync(() => getAppDirectoryCategories(), [locale]);
  const collections = useAsync(
    () => getAppDirectoryCollections(),
    [locale]
  )?.sort((a, b) => a.position - b.position);

  const jwidth = RN.Dimensions.get("screen").width - 32;

  const styles = stylesheet.createThemedStyleSheet({
    category: {
      flex: 1,
      backgroundColor: semanticColors.BG_MOD_SUBTLE,
      flexDirection: "row",
      gap: 8,
      paddingVertical: 8,
      paddingHorizontal: 8,
      borderRadius: 8,
      margin: 5,
    },
    categoryIcon: {
      width: 24,
      height: 24,
      tintColor: semanticColors.INTERACTIVE_NORMAL,
    },
    androidRipple: {
      color: semanticColors.ANDROID_RIPPLE,
      cornerRadius: 8,
    },
  });
  const collectionStyles = stylesheet.createThemedStyleSheet({
    card: {
      backgroundColor: semanticColors.CARD_PRIMARY_BG,
      borderRadius: 8,
      width: jwidth,
    },
    cardImage: {
      backgroundColor: semanticColors.CARD_SECONDARY_BG,
      borderTopLeftRadius: 8,
      borderTopRightRadius: 8,
      width: "100%",
      aspectRatio: 2.5 / 1,
    },
    cardContent: {
      paddingHorizontal: 16,
      paddingVertical: 16,
      flexDirection: "column",
      gap: 4,
    },

    smallProfile: {
      flexDirection: "row",
      gap: 16,
    },
    smallAvatar: {
      backgroundColor: semanticColors.BG_MOD_FAINT,
      width: 48,
      height: 48,
      borderRadius: 2147483647,
    },
    smallProfileThing: {
      flexDirection: "column",
      justifyContent: "center",
      gap: 4,
    },
  });

  const navigation = NavigationNative.useNavigation();
  const unsub = navigation.addListener("focus", () => {
    unsub();
    navigation.setOptions({
      title: "App Directory",
    });
  });

  const onAppPress = (app: APICollectionItem) => () =>
    pushScreen
      ? pushScreen("APP_INFO", {
          app,
          guildId,
        })
      : navigation.push("VendettaCustomPage", {
          title: app.application.name,
          render: getAppInfoPageRender(app, guildId),
        });

  return (
    <ScrollView
      style={{
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 16,
      }}
    >
      <Search
        style={{ paddingHorizontal: 8, paddingBottom: 16 }}
        onChangeText={() => showToast("doesn't do anything yet sorry")}
      />
      {categories ? (
        <RN.FlatList
          data={[{ id: 0, name: "All" }, ...categories]}
          renderItem={({ item }) => (
            <RN.Pressable
              style={styles.category}
              android_ripple={styles.androidRipple}
              onPress={() => showToast("doesn't do anything yet sorry")}
            >
              <RN.Image
                style={styles.categoryIcon}
                source={getAssetIDByName(
                  {
                    0: "ic_globe_24px",
                    4: "ic_monitor_24px",
                    6: "ic_controller_24px",
                    8: "img_nitro_remixing",
                    9: "ic_friend_wave_24px",
                    10: "ic_progress_wrench_24px",
                  }[item.id] ?? ""
                )}
              />
              <SimpleText
                variant="text-md/semibold"
                color="TEXT_NORMAL"
                style={{ flexWrap: "wrap", flexShrink: 1 }}
              >
                {item.name}
              </SimpleText>
            </RN.Pressable>
          )}
          numColumns={2}
          style={{ paddingBottom: 16 }}
        />
      ) : (
        <RN.ActivityIndicator
          size="small"
          style={{ flex: 1, paddingBottom: 16 }}
        />
      )}
      {collections ? (
        collections.map((x, i) => (
          <>
            <SimpleText
              variant="text-lg/bold"
              color="TEXT_NORMAL"
              style={{ paddingBottom: 24, paddingTop: i !== 0 ? 30 : 0 }}
            >
              {x.title}
            </SimpleText>
            <RN.FlatList
              horizontal
              data={x.application_directory_collection_items.sort(
                (a, b) => a.position - b.position
              )}
              ItemSeparatorComponent={() => <View style={{ width: 8 }} />}
              renderItem={({ item: app }) =>
                x.type === APICollectionType.Big ? (
                  <RN.Pressable
                    style={[collectionStyles.card]}
                    android_ripple={styles.androidRipple}
                    onPress={onAppPress(app)}
                  >
                    {app.image_hash && (
                      <RN.Image
                        style={collectionStyles.cardImage}
                        source={{
                          uri: `https://cdn.discordapp.com/app-assets/application-directory/collection-items/${app.id}/${app.image_hash}.webp?size=512`,
                        }}
                        resizeMode="cover"
                      />
                    )}
                    <View style={collectionStyles.cardContent}>
                      <SimpleText
                        variant="text-lg/semibold"
                        color="TEXT_NORMAL"
                        style={{ paddingBottom: 4 }}
                      >
                        {app.application.name}
                      </SimpleText>
                      <SimpleText
                        variant="text-md/semibold"
                        color="TEXT_NORMAL"
                        lineClamp={2}
                      >
                        {app.application.directory_entry.short_description}
                      </SimpleText>
                    </View>
                  </RN.Pressable>
                ) : x.type === APICollectionType.Medium ? (
                  <RN.Pressable
                    style={[collectionStyles.card, { width: jwidth / 1.5 }]}
                    android_ripple={styles.androidRipple}
                    onPress={onAppPress(app)}
                  >
                    {app.image_hash && (
                      <RN.Image
                        style={collectionStyles.cardImage}
                        source={{
                          uri: `https://cdn.discordapp.com/app-assets/application-directory/collection-items/${app.id}/${app.image_hash}.webp?size=256`,
                        }}
                        resizeMode="cover"
                      />
                    )}
                    <View style={collectionStyles.cardContent}>
                      <SimpleText
                        variant="text-md/semibold"
                        color="TEXT_NORMAL"
                      >
                        {app.application.name}
                      </SimpleText>
                      <SimpleText
                        variant="text-md/medium"
                        color="TEXT_MUTED"
                        style={{ paddingBottom: 8 }}
                      >
                        {app.application.categories[0] && (
                          <>
                            {app.application.categories[0].name}
                            <SimpleText
                              variant="text-md/bold"
                              color="TEXT_MUTED"
                              style={{ opacity: 0.5 }}
                            >
                              {"  "}·{"  "}
                            </SimpleText>
                          </>
                        )}
                        {inServers(app.application.directory_entry.guild_count)}
                      </SimpleText>
                      <SimpleText
                        variant="text-md/semibold"
                        color="TEXT_NORMAL"
                        lineClamp={2}
                      >
                        {app.application.directory_entry.short_description}
                      </SimpleText>
                    </View>
                  </RN.Pressable>
                ) : (
                  <RN.Pressable
                    style={[collectionStyles.card, { width: jwidth / 1.55 }]}
                    android_ripple={styles.androidRipple}
                    onPress={onAppPress(app)}
                  >
                    <View style={collectionStyles.cardContent}>
                      <View style={collectionStyles.smallProfile}>
                        <RN.Image
                          style={collectionStyles.smallAvatar}
                          source={{
                            uri: `https://cdn.discordapp.com/app-icons/${app.application.id}/${app.application.icon}.webp?size=60`,
                          }}
                        />
                        <View style={collectionStyles.smallProfileThing}>
                          <SimpleText
                            variant="text-md/semibold"
                            color="TEXT_NORMAL"
                          >
                            {app.application.name}
                          </SimpleText>
                          {app.application.categories[0] && (
                            <SimpleText
                              variant="text-md/medium"
                              color="TEXT_MUTED"
                            >
                              {app.application.categories[0].name}
                            </SimpleText>
                          )}
                        </View>
                      </View>
                      <SimpleText
                        variant="text-md/medium"
                        color="TEXT_MUTED"
                        style={{ paddingBottom: 8 }}
                      >
                        {inServers(app.application.directory_entry.guild_count)}
                      </SimpleText>
                      <SimpleText
                        variant="text-md/semibold"
                        color="TEXT_NORMAL"
                        lineClamp={2}
                      >
                        {app.application.directory_entry.short_description}
                      </SimpleText>
                    </View>
                  </RN.Pressable>
                )
              }
            />
          </>
        ))
      ) : (
        <RN.ActivityIndicator
          size="small"
          style={{ flex: 1, paddingBottom: 16 }}
        />
      )}
      <View style={{ height: 48 }} />
    </ScrollView>
  );
}
