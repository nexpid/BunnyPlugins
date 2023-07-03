import {
  NavigationNative,
  React,
  clipboard,
  url,
} from "@vendetta/metro/common";
import { useChangelog } from "../../../../stuff/changelog";
import { plugin } from "@vendetta";
import {
  BetterTableRowGroup,
  LineDivider,
  SuperAwesomeIcon,
} from "../../../../stuff/types";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { getIssueUrl } from "../../../../stuff/getIssueUrl";
import { vstorage } from "..";
import {
  SettingsActivity,
  checkSettingsActivity,
  dispatchActivityIfPossible,
  isActivitySaved,
  makeEmptySettingsActivity,
} from "../stuff/activity";
import { useProxy } from "@vendetta/storage";
import { Forms, General } from "@vendetta/ui/components";
import { showToast } from "@vendetta/ui/toasts";
import { showConfirmationAlert } from "@vendetta/ui/alerts";
import { activitySavedPrompt } from "../stuff/prompts";
import PresetProfiles from "../stuff/presetProfiles";
import { showProfileList } from "./pages/ProfileList";
import RPCPreview from "./RPCPreview";

const { ScrollView } = General;
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

export let forceUpdateSettings: () => void;

export default (): React.JSX.Element => {
  const navigation = NavigationNative.useNavigation();
  const [_, forceUpdate] = React.useReducer((x) => ~x, 0);
  forceUpdateSettings = forceUpdate;

  vstorage.settings ??= {
    edit: false,
    display: false,
  };
  vstorage.activity ??= {
    editing: makeEmptySettingsActivity(),
  };
  vstorage.profiles ??= PresetProfiles;
  useProxy(vstorage);
  dispatchActivityIfPossible();

  React.useEffect(() => {
    useChangelog(plugin, [
      {
        changes: ["+ the entire plugin guhhh"],
      },
    ]);
    navigation.setOptions({
      headerRight: () => (
        <SuperAwesomeIcon
          icon={getAssetIDByName("ic_message_report")}
          style="header"
          onPress={() => url.openURL(getIssueUrl("customrpc"))}
        />
      ),
    });
  }, []);

  return (
    <ScrollView>
      <BetterTableRowGroup
        title="Preview"
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
        icon={getAssetIDByName("ic_cog24px")}
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
            showToast("Copied", getAssetIDByName("Check"));
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

                vstorage.activity.editing = data;
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
    </ScrollView>
  );
};
