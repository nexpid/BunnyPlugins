import { findByName, findByStoreName } from "@vendetta/metro";
import { NavigationNative, React, stylesheet } from "@vendetta/metro/common";
import { semanticColors } from "@vendetta/ui";
import { Button, General } from "@vendetta/ui/components";

import Text from "$/components/Text";
import { openSheet } from "$/types";

import {
  ActivityType,
  SettingsActivity,
  settingsActivityToRaw,
} from "../stuff/activity";
import {
  ActivityTypeActionSheet,
  ApplicationActionSheet,
  ButtonActionSheet,
  ImageActionSheet,
  simpleInput,
  TimestampActionSheet,
} from "../stuff/prompts";
import { displayImage, parseTimestamp, stringifyTimeDiff } from "../stuff/util";
import {
  activityTypePreview,
  forceUpdateSettings,
  placeholders,
} from "./Settings";

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

export let forceUpdateRPCPreview: () => void;

export default ({ edit, act }: { edit: boolean; act: SettingsActivity }) => {
  const [_, forceUpdate] = React.useReducer((x) => ~x, 0);
  forceUpdateRPCPreview = forceUpdate;

  const navigation = NavigationNative.useNavigation();
  const update = () => {
    forceUpdate();
    forceUpdateSettings?.();
  };

  if (edit)
    return (
      <>
        <View style={styles.actTypeCont}>
          <Text
            variant="eyebrow"
            color="TEXT_NORMAL"
            onPress={() =>
              openSheet(ActivityTypeActionSheet, {
                type: act.type ?? ActivityType.Playing,
                update: (x) => {
                  act.type = x;
                  update();
                },
              })
            }
          >
            {activityTypePreview[act.type ?? ActivityType.Playing]} ...
          </Text>
        </View>
        <View style={styles.card}>
          <View style={{ padding: 16 }}>
            <View style={styles.card2}>
              <View style={styles.images}>
                <Pressable
                  onPress={() =>
                    openSheet(ImageActionSheet, {
                      appId: act.app.id,
                      role: "Large",
                      image: act.assets.largeImg,
                      navigation,
                      update: (x) => {
                        act.assets.largeImg = x;
                        update();
                      },
                    })
                  }
                >
                  <Image
                    source={{
                      uri:
                        displayImage(act.assets.largeImg ?? ".", act.app.id) ??
                        placeholders.image,
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
                        update: (x) => {
                          act.assets.smallImg = x;
                          update();
                        },
                      })
                    }
                  >
                    <Image
                      source={{
                        uri:
                          displayImage(
                            act.assets.smallImg ?? ".",
                            act.app.id,
                          ) ?? placeholders.image,
                      }}
                      style={{ borderRadius: 14, width: 28, height: 28 }}
                    />
                  </Pressable>
                </View>
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  variant="text-md/semibold"
                  color="TEXT_NORMAL"
                  onPress={() =>
                    openSheet(ApplicationActionSheet, {
                      appId: act.app.id,
                      appName: act.app.name,
                      navigation,
                      update: (x) => {
                        if (x?.id !== act.app.id) {
                          if (!Number.isNaN(Number(act.assets.smallImg)))
                            delete act.assets.smallImg;
                          if (!Number.isNaN(Number(act.assets.largeImg)))
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
                </Text>
                <Text
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
                </Text>
                <Text
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
                </Text>
                <Text
                  variant="text-sm/normal"
                  color="TEXT_NORMAL"
                  onPress={() =>
                    openSheet(TimestampActionSheet, {
                      start: act.timestamps.start,
                      end: act.timestamps.end,
                      update: (x) => {
                        act.timestamps.start = x.start;
                        act.timestamps.end = x.end;
                        update();
                      },
                    })
                  }
                  liveUpdate={true}
                  getChildren={() =>
                    typeof act.timestamps.end === "string"
                      ? `{${act.timestamps.end}}`
                      : typeof act.timestamps.end === "number"
                        ? `${stringifyTimeDiff(
                            parseTimestamp(act.timestamps.end) - Date.now(),
                          )} left`
                        : typeof act.timestamps.start === "string"
                          ? `{${act.timestamps.start}}`
                          : typeof act.timestamps.start === "number"
                            ? `${stringifyTimeDiff(
                                Date.now() -
                                  parseTimestamp(act.timestamps.start),
                              )} elapsed`
                            : placeholders.timestamp
                  }
                />
              </View>
            </View>
            <View style={{ marginTop: 16 }}>
              <Button
                text={act.buttons[0]?.text ?? placeholders.button1}
                style={{ backgroundColor: "grey" }}
                size={"small"}
                onPress={() =>
                  openSheet(ButtonActionSheet, {
                    role: "1",
                    text: act.buttons[0]?.text,
                    url: act.buttons[0]?.url,
                    update: ({ text, url }) => {
                      if (!text && !url) act.buttons[0] = undefined;
                      else
                        act.buttons[0] = {
                          text,
                          url,
                        };

                      update();
                    },
                  })
                }
              />
            </View>
            <View style={{ marginTop: 10 }}>
              <Button
                text={act.buttons[1]?.text ?? placeholders.button2}
                style={{ backgroundColor: "grey" }}
                size={"small"}
                onPress={() =>
                  openSheet(ButtonActionSheet, {
                    role: "2",
                    text: act.buttons[1]?.text,
                    url: act.buttons[1]?.url,
                    update: ({ text, url }) => {
                      if (!text && !url) act.buttons[1] = undefined;
                      else
                        act.buttons[1] = {
                          text,
                          url,
                        };

                      update();
                    },
                  })
                }
              />
            </View>
          </View>
        </View>
      </>
    );
  else
    return (
      <UserActivityContainer
        user={UserStore.getCurrentUser()}
        activity={settingsActivityToRaw(act).activity}
      />
    );
};
