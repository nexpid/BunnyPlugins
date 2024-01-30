import {
  React,
  ReactNative as RN,
  stylesheet,
  url,
} from "@vendetta/metro/common";
import { semanticColors } from "@vendetta/ui";
import { showConfirmationAlert } from "@vendetta/ui/alerts";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { Forms } from "@vendetta/ui/components";
import { showToast } from "@vendetta/ui/toasts";

import RedesignButton from "$/components/compat/RedesignButton";
import SimpleText from "$/components/SimpleText";
import usePromise from "$/hooks/usePromise";
import {
  ActionSheet,
  ActionSheetCloseButton,
  ActionSheetContentContainer,
  ActionSheetTitleHeader,
  hideActionSheet,
} from "$/types";

import { newGameSuggestionURL, vstorage } from "../..";
import { purgeFiles } from "../../stuff/files";
import { getManifest } from "../../stuff/store";

const { FormRow, FormRadioRow } = Forms;

const styles = stylesheet.createThemedStyleSheet({
  wompwomp: {
    flexDirection: "column",
    gap: 8,
  },
  destructiveIcon: {
    tintColor: semanticColors.TEXT_DANGER,
  },
});

const destructiveText: Parameters<typeof SimpleText>[0] = {
  color: "TEXT_DANGER",
  variant: "text-md/semibold",
};

export default function SettingsActionSheet({
  kaboom,
}: {
  kaboom: () => void;
}) {
  const [changes, setChanges] = React.useState(vstorage.settings);

  // my vstorage thingy can't really compare like this so i have to do this workaround
  const hasChanges = React.useMemo(
    () => ["game"].some((x) => changes[x] !== vstorage.settings[x]),
    [changes],
  );

  const manifestP = usePromise((signal) => getManifest(signal));
  if (!manifestP.fulfilled)
    return <RN.ActivityIndicator size={"large"} style={{ flex: 1 }} />;

  const manifest = manifestP.success && manifestP.response;
  if (!manifest)
    return (
      <ActionSheet>
        <ActionSheetContentContainer>
          <ActionSheetTitleHeader
            title={"Settings"}
            trailing={
              <ActionSheetCloseButton onPress={() => hideActionSheet()} />
            }
          />
          <SimpleText
            variant="text-lg/semibold"
            color="TEXT_DANGER"
            style={styles.wompwomp}
          >
            Manifest failed to load.
          </SimpleText>
        </ActionSheetContentContainer>
      </ActionSheet>
    );

  return (
    <ActionSheet>
      <ActionSheetContentContainer>
        <ActionSheetTitleHeader
          title={"Settings"}
          trailing={
            <ActionSheetCloseButton onPress={() => hideActionSheet()} />
          }
        />
        <FormRow
          label="Game"
          subLabel="What game the DOOM plugin loads"
          leading={<FormRow.Icon source={getAssetIDByName("HubIcon")} />}
        />
        {manifest.games.map(({ title, id }) => (
          <FormRadioRow
            label={title}
            onPress={() =>
              setChanges({
                ...changes,
                game: id,
              })
            }
            selected={changes.game === id}
            style={{ marginHorizontal: 12 }}
          />
        ))}
        <FormRow
          label="Suggest new game"
          leading={<FormRow.Icon source={getAssetIDByName("ic_add_24px")} />}
          style={{ marginHorizontal: 12 }}
          onPress={() => url.openURL(newGameSuggestionURL())}
        />
        <FormRow
          label={<SimpleText {...destructiveText}>Delete Files</SimpleText>}
          leading={
            <FormRow.Icon
              style={styles.destructiveIcon}
              source={getAssetIDByName("ic_trash_24px")}
            />
          }
          onPress={() =>
            showConfirmationAlert({
              title: "Delete DOOM files?",
              content: "Are you sure you want to delete DOOM files?",
              confirmText: "Delete",
              confirmColor: "RED" as ButtonColors,
              cancelText: "Cancel",
              onConfirm: async () => {
                hideActionSheet();
                kaboom();
                await purgeFiles();
                showToast("Deleted files", getAssetIDByName("Check"));
              },
            })
          }
        />
        <RedesignButton
          variant="primary"
          size="md"
          text="Apply Changes"
          disabled={!hasChanges}
          onPress={() => {
            vstorage.settings = changes;
            hideActionSheet();
          }}
          style={{ paddingHorizontal: 16, paddingVertical: 8 }}
        />
      </ActionSheetContentContainer>
    </ActionSheet>
  );
}
