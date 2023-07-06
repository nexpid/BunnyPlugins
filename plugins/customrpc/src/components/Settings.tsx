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
    },
  };
  vstorage.activity ??= {
    editing: makeEmptySettingsActivity(),
  };
  vstorage.profiles ??= PresetProfiles;
  useProxy(vstorage);

  React.useEffect(() => {
    useChangelog(plugin, [
      {
        changes: ["+ the entire plugin guhhh"],
      },
    ]);
  }, []);

  React.useEffect(() => {
    if (vstorage.settings.display) dispatchActivityIfPossible();
  }, [JSON.stringify(vstorage.activity.editing), vstorage.settings.display]);

  navigation.setOptions({
    headerRight: () => (
      <ErrorBoundary>
        <View style={{ flexDirection: "row-reverse" }}>
          <SuperAwesomeIcon
            style="header"
            icon={getAssetIDByName("ic_report_message")}
            onPress={() => openPluginReportSheet("customrpc")}
          />
        </View>
      </ErrorBoundary>
    ),
  });

  let dbgCounter = 0,
    dbgCounterTimeout: number;

  return (
    <ScrollView>
      <BetterTableRowGroup
        title="Preview"
        onTitlePress={() => {
          if (vstorage.settings.debug.enabled) {
            vstorage.settings.debug.visible = !vstorage.settings.debug.visible;
            showToast(
              `Debug tab ${
                vstorage.settings.debug.visible ? "visible" : "hidden"
              }`
            );
          } else {
            if (dbgCounterTimeout) clearTimeout(dbgCounterTimeout);
            dbgCounterTimeout = setTimeout(() => {
              dbgCounter = 0;
            }, 750);
            dbgCounter++;

            if (dbgCounter < 2) return;

            if (dbgCounter < 7) showToast(`${7 - dbgCounter} more taps...`);
            else {
              showToast("Behold! You can now debug!");
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
      <BetterTableRowGroup title="Data" icon={getAssetIDByName("ic_feedback")}>
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
                    JSON.stringify(vstorage.profiles[vstorage.activity.profile])
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
          <LineDivider addPadding={true} />

          <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
            <Pressable
              android_ripple={styles.androidRipple}
              disabled={false}
              accessibilityRole={"button"}
              accessibilityLabel="boykisser"
              accessibilityHint="tap to boykiss"
              onPress={() => {
                const messages = "nya,mwah,uwu,nya~,guh,blehhh >:P".split(",");
                showToast(
                  messages[Math.floor(Math.random() * messages.length)]
                );
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
        </BetterTableRowGroup>
      )}
      <View style={{ marginBottom: 20 }} />
    </ScrollView>
  );
};
