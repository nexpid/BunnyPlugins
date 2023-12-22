import {
  i18n,
  NavigationNative,
  React,
  ReactNative as RN,
  stylesheet,
} from "@vendetta/metro/common";
import { semanticColors } from "@vendetta/ui";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { General } from "@vendetta/ui/components";

import {
  AdvancedSearch,
  SimpleText,
  useAdvancedSearch,
} from "../../../../../stuff/types";
import {
  APICollectionApplication,
  APICollectionItem,
  APICollectionType,
  getAppDirectoryCategories,
  getAppDirectoryCollections,
  searchAppDirectory,
} from "../../stuff/api";
import { inServers } from "../../stuff/util";
import useAsync from "../hooks/useAsync";
import { getAppInfoPageRender } from "./AppInfoPage";

const { ScrollView, View } = General;

export default function AppDirectoryPage({
  guildId,
  pushScreen,
}: {
  guildId?: string;
  pushScreen?: any;
}) {
  const locale = i18n.getLocale();

  const searchContext = { type: "APP_DIRECTORY_SEARCH" };
  const [search, controls] = useAdvancedSearch(searchContext);

  const [selCategory, setSelCategory] = React.useState(undefined);

  const categories = useAsync(() => getAppDirectoryCategories(), [locale]);
  const collections = useAsync(
    () => getAppDirectoryCollections(),
    [locale],
  )?.sort?.((a, b) => a.position - b.position);

  const [searchPage, setSearchPage] = React.useState(0);
  const searchResults = useAsync(
    () =>
      search || selCategory !== undefined
        ? searchAppDirectory(search, searchPage + 1, selCategory ?? 0, guildId)
        : null,
    [search, searchPage, selCategory, locale],
  );

  React.useEffect(() => {
    if (!search) setSelCategory(undefined);
    else if (search && !selCategory) setSelCategory(0);
  }, [search]);

  React.useEffect(() => {
    if (!searchResults) setSearchPage(0);
  }, [searchResults]);

  const jwidth = RN.Dimensions.get("screen").width - 32;

  const styles = stylesheet.createThemedStyleSheet({
    category: {
      backgroundColor: semanticColors.BG_SURFACE_OVERLAY,
      flexDirection: "row",
      justifyContent: "center",
      gap: 8,
      padding: 8,
      borderRadius: 8,
    },
    selCategory: {
      backgroundColor: semanticColors.BG_SURFACE_RAISED,
    },
    categoryIcon: {
      width: 24,
      height: 24,
      tintColor: semanticColors.INTERACTIVE_NORMAL,
    },
    bottomNav: {
      flexDirection: "row",
      marginTop: 16,
      gap: 8,
      justifyContent: "center",
    },
    bottomNavItem: {
      backgroundColor: semanticColors.BG_MOD_SUBTLE,
      borderRadius: 6969,
      paddingVertical: 6,
      paddingHorizontal: 11,
    },
    bottomNavItemOff: {
      backgroundColor: semanticColors.BG_MOD_FAINT,
      borderRadius: 6969,
      paddingVertical: 6,
      paddingHorizontal: 11,
    },
    bottomNavItemSelected: {
      backgroundColor: semanticColors.BUTTON_OUTLINE_BRAND_BACKGROUND_HOVER,
      borderRadius: 6969,
      paddingVertical: 6,
      paddingHorizontal: 11,
    },

    androidRipple: {
      color: semanticColors.ANDROID_RIPPLE,
      cornerRadius: 8,
      foreground: true,
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

  const onAppPress =
    (app: APICollectionItem | APICollectionApplication) => () =>
      pushScreen
        ? pushScreen("APP_INFO", {
            app: "application" in app ? app.application : app,
            guildId,
          })
        : navigation.push("VendettaCustomPage", {
            title: "application" in app ? app.application.name : app.name,
            render: getAppInfoPageRender(
              "application" in app ? app.application : app,
              guildId,
            ),
          });

  const pushPageI = searchResults
    ? Math.max(Math.min(searchPage - 3, searchResults.num_pages - 7), 0)
    : 0;
  const pushPages = searchResults
    ? new Array(searchResults.num_pages)
        .fill(0)
        .map((_, i) => ({ num: i + 1, selected: i === searchPage }))
        .slice(pushPageI, pushPageI + 7)
    : [];

  const pageFirst = pushPages[0]?.num === 1;
  const pageLast =
    pushPages[pushPages.length - 1]?.num === searchResults?.num_pages;
  const renderPushPages = pushPages.slice(
    pageFirst ? 0 : 2,
    pageLast ? pushPages.length : pushPages.length - 2,
  );

  const isFirst = searchPage === 0;
  const isLast = searchResults && searchPage === searchResults.num_pages - 1;

  return (
    <ScrollView
      style={{
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 12,
      }}
    >
      <AdvancedSearch searchContext={searchContext} controls={controls} />
      <View style={{ height: 12 }} />
      {categories ? (
        <RN.FlatList
          horizontal
          data={[{ id: 0, name: "All" }, ...categories].sort((a, b) =>
            selCategory
              ? a.id === selCategory
                ? -1
                : b.id === selCategory
                  ? 1
                  : 0
              : 0,
          )}
          keyExtractor={(d) => d.id.toString()}
          renderItem={({ item }) => (
            <RN.Pressable
              style={[
                styles.category,
                selCategory === item.id && styles.selCategory,
              ]}
              android_ripple={styles.androidRipple}
              onPress={() => {
                if (selCategory === item.id && !search)
                  setSelCategory(undefined);
                else setSelCategory(item.id);
                RN.LayoutAnimation.configureNext(
                  RN.LayoutAnimation.Presets.easeInEaseOut,
                );
              }}
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
                  }[item.id] ?? "",
                )}
              />
              <SimpleText variant="text-md/semibold" color="TEXT_NORMAL">
                {item.name}
              </SimpleText>
            </RN.Pressable>
          )}
          ItemSeparatorComponent={() => <View style={{ width: 8 }} />}
          style={{ paddingBottom: 16 }}
        />
      ) : (
        <RN.ActivityIndicator
          size="small"
          style={{ flex: 1, paddingBottom: 16 }}
        />
      )}
      {collections && searchResults !== undefined ? (
        searchResults ? (
          <>
            <RN.FlatList
              data={searchResults.results}
              ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
              renderItem={({ item: { data: app } }) => (
                <RN.Pressable
                  style={collectionStyles.card}
                  android_ripple={styles.androidRipple}
                  onPress={onAppPress(app)}
                >
                  <View style={collectionStyles.cardContent}>
                    <View style={collectionStyles.smallProfile}>
                      <RN.Image
                        style={collectionStyles.smallAvatar}
                        source={{
                          uri: `https://cdn.discordapp.com/app-icons/${app.id}/${app.icon}.webp?size=60`,
                        }}
                      />
                      <View style={collectionStyles.smallProfileThing}>
                        <SimpleText
                          variant="text-md/semibold"
                          color="TEXT_NORMAL"
                        >
                          {app.name}
                        </SimpleText>
                        {app.categories[0] && (
                          <SimpleText
                            variant="text-md/medium"
                            color="TEXT_MUTED"
                          >
                            {app.categories[0].name}
                          </SimpleText>
                        )}
                      </View>
                    </View>
                    <SimpleText
                      variant="text-md/medium"
                      color="TEXT_MUTED"
                      style={{ paddingBottom: 8 }}
                    >
                      {inServers(app.directory_entry.guild_count)}
                    </SimpleText>
                    <SimpleText
                      variant="text-md/semibold"
                      color="TEXT_NORMAL"
                      lineClamp={2}
                    >
                      {app.directory_entry.short_description}
                    </SimpleText>
                  </View>
                </RN.Pressable>
              )}
            />
            <View style={styles.bottomNav}>
              <RN.Pressable
                style={isFirst ? styles.bottomNavItemOff : styles.bottomNavItem}
                onPress={() =>
                  setSearchPage(
                    Math.max(
                      Math.min(searchPage - 1, searchResults.num_pages - 1),
                      0,
                    ),
                  )
                }
                disabled={isFirst}
                key={"page-back"}
              >
                <SimpleText
                  variant="text-sm/bold"
                  color={isFirst ? "TEXT_MUTED" : "TEXT_NORMAL"}
                >
                  &lt;
                </SimpleText>
              </RN.Pressable>
              {!pageFirst && (
                <>
                  <RN.Pressable
                    style={styles.bottomNavItem}
                    onPress={() => setSearchPage(0)}
                    key={"page-1"}
                  >
                    <SimpleText variant="text-sm/semibold" color="TEXT_NORMAL">
                      1
                    </SimpleText>
                  </RN.Pressable>
                  <SimpleText
                    variant="text-md/semibold"
                    color="TEXT_MUTED"
                    key={"page-sep-left"}
                  >
                    ...
                  </SimpleText>
                </>
              )}
              {renderPushPages.map((x) => (
                <RN.Pressable
                  style={
                    x.selected
                      ? styles.bottomNavItemSelected
                      : styles.bottomNavItem
                  }
                  onPress={() => setSearchPage(x.num - 1)}
                  key={`page-${x.num}`}
                >
                  <SimpleText variant="text-sm/semibold" color="TEXT_NORMAL">
                    {x.num}
                  </SimpleText>
                </RN.Pressable>
              ))}
              {!pageLast && (
                <>
                  <SimpleText
                    variant="text-md/semibold"
                    color="TEXT_MUTED"
                    key={"page-sep-right"}
                  >
                    ...
                  </SimpleText>
                  <RN.Pressable
                    style={styles.bottomNavItem}
                    onPress={() => setSearchPage(searchResults.num_pages - 1)}
                    key={`page-${searchResults.num_pages}`}
                  >
                    <SimpleText variant="text-sm/semibold" color="TEXT_NORMAL">
                      {searchResults.num_pages}
                    </SimpleText>
                  </RN.Pressable>
                </>
              )}
              <RN.Pressable
                style={isLast ? styles.bottomNavItemOff : styles.bottomNavItem}
                onPress={() =>
                  setSearchPage(
                    Math.max(
                      Math.min(searchPage + 1, searchResults.num_pages - 1),
                      0,
                    ),
                  )
                }
                disabled={isLast}
                key={"page-next"}
              >
                <SimpleText
                  variant="text-sm/bold"
                  color={isLast ? "TEXT_MUTED" : "TEXT_NORMAL"}
                >
                  &gt;
                </SimpleText>
              </RN.Pressable>
            </View>
          </>
        ) : (
          <>
            {collections.map((x, i) => (
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
                    (a, b) => a.position - b.position,
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
                            {inServers(
                              app.application.directory_entry.guild_count,
                            )}
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
                        style={[
                          collectionStyles.card,
                          { width: jwidth / 1.55 },
                        ]}
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
                            {inServers(
                              app.application.directory_entry.guild_count,
                            )}
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
            ))}
          </>
        )
      ) : (
        <RN.ActivityIndicator size="small" style={{ flex: 1, marginTop: 50 }} />
      )}
      <View style={{ height: 48 }} />
    </ScrollView>
  );
}
