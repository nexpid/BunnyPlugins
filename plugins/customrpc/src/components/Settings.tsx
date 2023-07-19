import {
  NavigationNative,
  React,
  ReactNative as RN,
  clipboard,
  stylesheet,
} from "@vendetta/metro/common";
import { useChangelog } from "../../../../stuff/changelog";
import { plugin } from "@vendetta";
import {
  BetterTableRowGroup,
  LineDivider,
  SuperAwesomeIcon,
} from "../../../../stuff/types";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { openPluginReportSheet } from "../../../../stuff/githubReport";
import { vstorage } from "..";
import {
  SettingsActivity,
  checkSettingsActivity,
  cleanSettingsActivity,
  dispatchActivityIfPossible,
  isActivitySaved,
  makeEmptySettingsActivity,
} from "../stuff/activity";
import { useProxy } from "@vendetta/storage";
import { ErrorBoundary, Forms, General } from "@vendetta/ui/components";
import { showToast } from "@vendetta/ui/toasts";
import { activitySavedPrompt } from "../stuff/prompts";
import PresetProfiles from "../stuff/presetProfiles";
import { showProfileList } from "./pages/ProfileList";
import RPCPreview from "./RPCPreview";
import { openLiveRawActivityView } from "./pages/LiveRawActivityView";
import { proxyAssetCache } from "../stuff/api";
import { semanticColors } from "@vendetta/ui";
import { FadeView } from "../../../../stuff/animations";
import { showConfirmationAlert } from "@vendetta/ui/alerts";
import { stringVariables } from "../stuff/variables";
import { storage } from "@vendetta/plugin";

const { MMKVManager } = window.nativeModuleProxy;

const { ScrollView, View, Pressable } = General;
const { FormSwitchRow, FormIcon, FormRow } = Forms;

export const placeholders = {
  image: "https://discord.com/assets/cb1043c312ec65507573c06c37f6ee63.gif",
  appName: "Enter App Name...",
  details: "Enter Details...",
  state: "Enter State...",
  timestamp: "Enter Timestamp...",
  button1: "Edit Button 1...",
  button2: "Edit Button 2...",
};
export const activityTypePreview = {
  0: "Playing",
  2: "Listening to",
  3: "Watching",
  5: "Competing in",
};

const styles = stylesheet.createThemedStyleSheet({
  androidRipple: {
    color: semanticColors.ANDROID_RIPPLE,
    cornerRadius: 8,
  },
});

export let forceUpdateSettings: () => void;
export default (): React.JSX.Element => {
  const navigation = NavigationNative.useNavigation();
  const [_, forceUpdate] = React.useReducer((x) => ~x, 0);
  forceUpdateSettings = forceUpdate;

  vstorage.settings ??= {
    edit: false,
    display: false,
    debug: {
      enabled: false,
      visible: false,
      boykisserDead: undefined,
    },
  };
  vstorage.activity ??= {
    editing: makeEmptySettingsActivity(),
  };
  vstorage.profiles ??= PresetProfiles;
  useProxy(vstorage);

  React.useEffect(() => {
    if (vstorage.settings.debug.boykisserDead === undefined) return;

    useChangelog(plugin, [
      {
        changes: [
          "+ added boykisser back",
          "+ you can now kill boykisser (don't)",
          "+ fixed typo",
          "+ added a string variables 'Help' button",
        ],
      },
      {
        changes: ["+ initial update guhhh"],
      },
    ]);
  }, [vstorage.settings.debug.boykisserDead === undefined]);
  React.useEffect(() => {
    if (vstorage.settings.debug.boykisserDead === undefined) return;
    if (vstorage.settings.display) dispatchActivityIfPossible();
  }, [
    JSON.stringify(vstorage.activity.editing),
    vstorage.settings.display,
    vstorage.settings.debug.boykisserDead === undefined,
  ]);

  if (vstorage.settings.debug.boykisserDead === undefined) {
    MMKVManager.getItem("CRPC_boykisser").then((x) => {
      vstorage.settings.debug.boykisserDead = x === "true";
      forceUpdate();
    });
    return <RN.ActivityIndicator style={{ flex: 1 }} />;
  }

  const unsub = navigation.addListener("focus", () => {
    unsub();
    navigation.setOptions({
      headerRight: () => (
        <View style={{ flexDirection: "row-reverse" }}>
          <SuperAwesomeIcon
            style="header"
            icon={getAssetIDByName("ic_report_message")}
            onPress={() => openPluginReportSheet("customrpc")}
          />
          <SuperAwesomeIcon
            style="header"
            icon={getAssetIDByName("ic_essentials_sparkle")}
            onPress={() =>
              showConfirmationAlert({
                title: "String Variables",
                content: `String variables can be used in any text component\nHere's the entire list:\n\n${stringVariables
                  .map((x) => `**\`${x.match}\`**\n — ${x.description}`)
                  .join("\n")}`,
                confirmText: "Dismiss",
                confirmColor: "brand" as ButtonColors,
                onConfirm: () => undefined,
              })
            }
          />
        </View>
      ),
    });
  });

  let dbgCounter = 0,
    dbgCounterTimeout: number;
  let bkCounter = -1,
    bkCounterTimeout: number;

  return (
    <>
      <FadeView
        style={[
          {
            backgroundColor: "#f11",
            position: "absolute",
            width: "100%",
            height: "100%",
            zIndex: 2,
          },
        ]}
        fade={"out"}
        duration={1000}
        trigger={vstorage.settings.debug.boykisserDead}
        setDisplay={true}
        animateOnInit={false}
      />
      <ScrollView
        style={{
          zIndex: 1,
        }}
      >
        <BetterTableRowGroup
          title="Preview"
          onTitlePress={() => {
            if (vstorage.settings.debug.enabled) {
              vstorage.settings.debug.visible =
                !vstorage.settings.debug.visible;
              showToast(
                vstorage.settings.debug.boykisserDead
                  ? `debug tab ${
                      vstorage.settings.debug.visible ? "on" : "off"
                    }`
                  : `Debug tab ${
                      vstorage.settings.debug.visible ? "visible" : "hidden"
                    }`
              );
            } else {
              if (dbgCounterTimeout) clearTimeout(dbgCounterTimeout);
              dbgCounterTimeout = setTimeout(() => {
                dbgCounter = 0;
              }, 500);
              dbgCounter++;

              if (dbgCounter < 2) return;

              if (dbgCounter < 7) {
                const more = 7 - dbgCounter;
                return showToast(
                  vstorage.settings.debug.boykisserDead
                    ? `tap ${more} more time${more !== 1 ? "s" : ""}`
                    : `${more} more taps`
                );
              } else {
                showToast(
                  vstorage.settings.debug.boykisserDead
                    ? "the sin of murdering boykisser continues to haunt you"
                    : "Behold! You can now debug!"
                );
                vstorage.settings.debug.visible = true;
                vstorage.settings.debug.enabled = true;
                forceUpdate();
              }
            }
          }}
          icon={getAssetIDByName("ic_eye")}
          padding={vstorage.settings.edit}
        >
          <RPCPreview
            edit={vstorage.settings.edit}
            act={vstorage.activity.editing}
          />
        </BetterTableRowGroup>
        <BetterTableRowGroup
          title="Settings"
          icon={getAssetIDByName("ic_cog_24px")}
        >
          <FormSwitchRow
            label="Edit Mode"
            subLabel="Be able to edit your activity"
            leading={<FormIcon source={getAssetIDByName("ic_badge_staff")} />}
            onValueChange={() =>
              (vstorage.settings.edit = !vstorage.settings.edit)
            }
            value={vstorage.settings.edit}
          />
          <FormSwitchRow
            label="Display Activity"
            subLabel="Show off your super awesome poggers activity to the world"
            leading={<FormIcon source={getAssetIDByName("ic_show_password")} />}
            onValueChange={() =>
              (vstorage.settings.display = !vstorage.settings.display)
            }
            value={vstorage.settings.display}
          />
        </BetterTableRowGroup>
        <BetterTableRowGroup
          title="Data"
          icon={getAssetIDByName("ic_feedback")}
        >
          <FormRow
            label="Copy as JSON"
            leading={<FormRow.Icon source={getAssetIDByName("copy")} />}
            onPress={() => {
              clipboard.setString(
                JSON.stringify(vstorage.activity.editing, undefined, 3)
              );
              showToast("Copied", getAssetIDByName("toast_copy_link"));
            }}
          />
          <FormRow
            label="Load from Clipboard"
            leading={
              <FormRow.Icon source={getAssetIDByName("ic_download_24px")} />
            }
            onPress={() =>
              activitySavedPrompt({
                role: "overwrite the activity data",
                button: "Overwrite",
                run: async () => {
                  let data: SettingsActivity;
                  try {
                    data = JSON.parse(await clipboard.getString());
                  } catch {
                    return showToast(
                      "Failed to parse JSON",
                      getAssetIDByName("Small")
                    );
                  }

                  if (!checkSettingsActivity(data))
                    return showToast(
                      "Invalid activity data",
                      getAssetIDByName("Small")
                    );

                  vstorage.activity.editing = cleanSettingsActivity(data);
                  delete vstorage.activity.profile;
                  forceUpdate();
                  showToast("Loaded", getAssetIDByName("Check"));
                },
              })
            }
          />
          <LineDivider addPadding={true} />
          {vstorage.activity.profile && (
            <FormRow
              label={`Save Profile${!isActivitySaved() ? " 🔴" : ""}`}
              leading={
                <FormRow.Icon source={getAssetIDByName("ic_message_edit")} />
              }
              onPress={() => {
                vstorage.profiles[vstorage.activity.profile] = JSON.parse(
                  JSON.stringify(vstorage.activity.editing)
                );
                showToast("Saved", getAssetIDByName("Check"));
                forceUpdate();
              }}
            />
          )}
          {vstorage.activity.profile && (
            <FormRow
              label="Revert Profile"
              leading={
                <FormRow.Icon source={getAssetIDByName("ic_message_edit")} />
              }
              onPress={() =>
                activitySavedPrompt({
                  role: "revert",
                  button: "Revert",
                  run: () => {
                    vstorage.activity.editing = JSON.parse(
                      JSON.stringify(
                        vstorage.profiles[vstorage.activity.profile]
                      )
                    );
                    showToast("Reverted", getAssetIDByName("Check"));
                    forceUpdate();
                  },
                })
              }
            />
          )}
          {vstorage.activity.profile && (
            <FormRow
              label="Close Profile"
              leading={
                <FormRow.Icon source={getAssetIDByName("ic_message_edit")} />
              }
              onPress={() =>
                activitySavedPrompt({
                  role: "discard your changes",
                  button: "Discard",
                  run: () => {
                    vstorage.activity.editing = makeEmptySettingsActivity();
                    delete vstorage.activity.profile;
                    showToast("Closed", getAssetIDByName("Check"));
                    forceUpdate();
                  },
                  secondaryButton: "Save profile",
                  secondaryRun: () => {
                    vstorage.profiles[vstorage.activity.profile] = JSON.parse(
                      JSON.stringify(vstorage.activity.editing)
                    );
                  },
                })
              }
            />
          )}
          <FormRow
            label="Browse Profiles"
            leading={
              <FormRow.Icon source={getAssetIDByName("ic_message_edit")} />
            }
            trailing={<FormRow.Arrow />}
            onPress={() => showProfileList(navigation)}
          />
        </BetterTableRowGroup>
        {vstorage.settings.debug.visible && (
          <BetterTableRowGroup
            title="Debug"
            icon={getAssetIDByName("ic_progress_wrench_24px")}
          >
            <FormRow
              label="Live RawActivity View"
              trailing={<FormRow.Arrow />}
              leading={
                <FormRow.Icon source={getAssetIDByName("ic_badge_staff")} />
              }
              onPress={() => openLiveRawActivityView(navigation)}
            />
            <FormRow
              label="Flush MP Cache"
              leading={
                <FormRow.Icon source={getAssetIDByName("ic_badge_staff")} />
              }
              onPress={() => {
                let changes = 0;
                for (const x of Object.keys(proxyAssetCache)) {
                  changes++;
                  delete proxyAssetCache[x];
                }

                const faces = ":3,>:3,:D,>:D,:P,>:P".split(",");
                showToast(
                  `flushed cache ${
                    faces[Math.floor(Math.random() * faces.length)]
                  }`
                );
                if (changes > 0) dispatchActivityIfPossible();
              }}
            />

            {!vstorage.settings.debug.boykisserDead && (
              <>
                <LineDivider addPadding={true} />
                <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
                  <Pressable
                    android_ripple={styles.androidRipple}
                    disabled={false}
                    accessibilityRole={"button"}
                    accessibilityLabel="boykisser"
                    accessibilityHint="tap to boykiss"
                    onPress={() => {
                      const messages = "nya,mwah,uwu,nya~,guh,blehhh >:P".split(
                        ","
                      );
                      showToast(
                        messages[Math.floor(Math.random() * messages.length)]
                      );
                    }}
                    delayLongPress={500}
                    onLongPress={() => {
                      if (vstorage.settings.debug.boykisserDead)
                        return showToast("fuck you");

                      if (bkCounterTimeout) clearTimeout(bkCounterTimeout);
                      bkCounterTimeout = setTimeout(() => {
                        bkCounter = -1;
                      }, 3000);
                      bkCounter++;

                      const messages = [
                        "tapping and holding on boykisser will kill him. are you sure?",
                        "i am serious, are you sure?",
                        "are you TOTALLY sure you want to kill him?",
                        "this cannot be undone",
                        "please, have mercy on him",
                        "this is your last warning, he will be forever killed",
                        "you don't want to do this",
                        "please, i beg you",
                      ];

                      if (!messages[bkCounter]) {
                        vstorage.settings.debug.boykisserDead = true;
                        MMKVManager.setItem("CRPC_boykisser", "true");
                        forceUpdate();
                        showToast("you have MURDERED boykisser. fuck you");
                      } else showToast(messages[bkCounter]);
                    }}
                  >
                    <RN.Image
                      source={{
                        uri: "https://cdn.discordapp.com/attachments/919655852724604978/1126175249424191548/723.gif",
                      }}
                      style={{
                        borderRadius: 8,
                        width: "100%",
                        aspectRatio: 1,
                      }}
                    />
                  </Pressable>
                </View>
              </>
            )}
          </BetterTableRowGroup>
        )}
        <View style={{ marginBottom: 20 }} />
      </ScrollView>
    </>
  );
};
