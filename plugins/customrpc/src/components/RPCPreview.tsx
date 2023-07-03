import { findByName, findByStoreName } from "@vendetta/metro";
import {
  ActivityType,
  SettingsActivity,
  settingsActivityToRaw,
} from "../stuff/activity";
import { NavigationNative, React, stylesheet } from "@vendetta/metro/common";
import { General } from "@vendetta/ui/components";
import { semanticColors } from "@vendetta/ui";
import { SimpleText } from "../../../../stuff/types";
import {
  activityTypePreview,
  forceUpdateSettings,
  placeholders,
} from "./Settings";
import {
  ActivityTypeActionSheet,
  ApplicationActionSheet,
  ImageActionSheet,
  TimestampActionSheet,
  openSheet,
  simpleInput,
} from "../stuff/prompts";
import { parseTimestamp, stringifyTimeDiff } from "../stuff/util";

const UserStore = findByStoreName("UserStore");

const { View, Image, Pressable } = General;
const UserActivityContainer = findByName("UserActivityContainer");

const styles = stylesheet.createThemedStyleSheet({
  actTypeCont: {
    flexDirection: "row",
    marginBottom: 12,
    justifyContent: "space-between",
  },
  card: {
    borderWidth: 1,
    borderRadius: 8,
    borderColor: semanticColors.BACKGROUND_MODIFIER_ACCENT,
  },
  card2: { alignItems: "flex-start", flexDirection: "row" },
  images: { position: "relative", marginRight: 10 },
  smallImageBg: {
    borderColor: semanticColors.BACKGROUND_PRIMARY,
    backgroundColor: semanticColors.BACKGROUND_PRIMARY,
    borderWidth: 1,
    borderRadius: 18,
    position: "absolute",
    right: -4,
    bottom: -4,
  },
});

export default ({
  edit,
  act,
}: {
  edit: boolean;
  act: SettingsActivity;
}): React.JSX.Element => {
  const [_, forceUpdate] = React.useReducer((x) => ~x, 0);
  const navigation = NavigationNative.useNavigation();
  const update = () => {
    forceUpdate();
    forceUpdateSettings?.();
  };

  if (edit)
    return (
      <>
        <View style={styles.actTypeCont}>
          <SimpleText
            variant="eyebrow"
            color="TEXT_NORMAL"
            onPress={() =>
              openSheet(ActivityTypeActionSheet, {
                type: act.type ?? ActivityType.Playing,
                update: (x: ActivityType) => {
                  act.type = x;
                  update();
                },
              })
            }
          >
            {activityTypePreview[act.type ?? ActivityType.Playing]} ...
          </SimpleText>
        </View>
        <View style={styles.card}>
          <View style={{ padding: 16 }}>
            <View style={styles.card2}>
              <View style={styles.images}>
                <Pressable
                  onPress={() =>
                    openSheet(ImageActionSheet, {
                      appId: act.app.id,
                      role: "Big",
                      image: act.assets.largeImg,
                      navigation,
                      update: (x: string) => {
                        act.assets.largeImg = x;
                        update();
                      },
                    })
                  }
                >
                  <Image
                    source={{
                      uri: act.assets.largeImg?.startsWith("mp:")
                        ? `https://media.discordapp.net/${act.assets.largeImg.slice(
                            3
                          )}`
                        : act.assets.largeImg
                        ? `https://cdn.discordapp.com/app-assets/${act.app.id}/${act.assets.largeImg}.png?size=56`
                        : placeholders.image,
                    }}
                    style={{ borderRadius: 3, width: 56, height: 56 }}
                  />
                </Pressable>
                <View style={styles.smallImageBg}>
                  <Pressable
                    onPress={() =>
                      openSheet(ImageActionSheet, {
                        appId: act.app.id,
                        role: "Small",
                        image: act.assets.smallImg,
                        navigation,
                        update: (x: string) => {
                          act.assets.smallImg = x;
                          update();
                        },
                      })
                    }
                  >
                    <Image
                      source={{
                        uri: act.assets.smallImg?.startsWith("mp:")
                          ? `https://media.discordapp.net/${act.assets.smallImg.slice(
                              3
                            )}`
                          : act.assets.smallImg
                          ? `https://cdn.discordapp.com/app-assets/${act.app.id}/${act.assets.smallImg}.png?size=56`
                          : placeholders.image,
                      }}
                      style={{ borderRadius: 14, width: 28, height: 28 }}
                    />
                  </Pressable>
                </View>
              </View>
              <View style={{ flex: 1 }}>
                <SimpleText
                  variant="text-md/semibold"
                  color="TEXT_NORMAL"
                  onPress={() =>
                    openSheet(ApplicationActionSheet, {
                      appId: act.app.id,
                      appName: act.app.name,
                      navigation,
                      update: (
                        x: { name?: string; id?: string } | undefined
                      ) => {
                        if (x?.id !== act.app.id) {
                          if (!act.assets.smallImg.startsWith("mp:"))
                            delete act.assets.smallImg;
                          if (!act.assets.largeImg.startsWith("mp:"))
                            delete act.assets.largeImg;
                        }

                        act.app.id = x?.id;
                        act.app.name = x?.name;
                        update();
                      },
                    })
                  }
                >
                  {act.app.name ?? placeholders.appName}
                </SimpleText>
                <SimpleText
                  variant="text-sm/normal"
                  color="TEXT_NORMAL"
                  onPress={() =>
                    simpleInput({
                      role: "Details",
                      current: act.details,
                      update: (x) => {
                        act.details = x;
                        update();
                      },
                    })
                  }
                >
                  {act.details ?? placeholders.details}
                </SimpleText>
                <SimpleText
                  variant="text-sm/normal"
                  color="TEXT_NORMAL"
                  onPress={() =>
                    simpleInput({
                      role: "State",
                      current: act.state,
                      update: (x) => {
                        act.state = x;
                        update();
                      },
                    })
                  }
                >
                  {act.state ?? placeholders.state}
                </SimpleText>
                <SimpleText
                  variant="text-sm/normal"
                  color="TEXT_NORMAL"
                  onPress={() =>
                    openSheet(TimestampActionSheet, {
                      start: act.timestamps.start,
                      end: act.timestamps.end,
                      update: (x: { start?: number; end?: number }) => {
                        act.timestamps.start = x.start;
                        act.timestamps.end = x.end;
                        update();
                      },
                    })
                  }
                  liveUpdate={true}
                  getChildren={() =>
                    act.timestamps.end
                      ? `${stringifyTimeDiff(
                          parseTimestamp(act.timestamps.end) - Date.now()
                        )} left`
                      : act.timestamps.start
                      ? `${stringifyTimeDiff(
                          Date.now() - parseTimestamp(act.timestamps.start)
                        )} passed`
                      : placeholders.timestamp
                  }
                />
              </View>
            </View>
          </View>
        </View>
      </>
    );
  else
    return (
      <UserActivityContainer
        user={UserStore.getCurrentUser()}
        activity={settingsActivityToRaw(act)}
      />
    );
};
