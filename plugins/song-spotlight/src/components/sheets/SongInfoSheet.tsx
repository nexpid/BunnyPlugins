import { Forms } from "@vendetta/ui/components";
import {
  ActionSheet,
  ActionSheetCloseButton,
  ActionSheetContentContainer,
  ActionSheetTitleHeader,
  SimpleText,
  hideActionSheet,
} from "../../../../../stuff/types";
import { API } from "../../types/api";
import { clipboard, stylesheet } from "@vendetta/metro/common";
import { semanticColors } from "@vendetta/ui";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { rebuildLink } from "../../stuff/util";
import { showToast } from "@vendetta/ui/toasts";

const { FormRow } = Forms;

const destructiveText = {
  color: "TEXT_DANGER",
  variant: "text-md/semibold",
};

export default function ({
  song,
  remove,
}: {
  song: API.Song;
  remove: () => void;
}) {
  const styles = stylesheet.createThemedStyleSheet({
    destructiveIcon: {
      tintColor: semanticColors.TEXT_DANGER,
    },
  });

  return (
    <ActionSheet>
      <ActionSheetContentContainer>
        <ActionSheetTitleHeader
          title={"Edit Song"}
          trailing={<ActionSheetCloseButton onPress={hideActionSheet} />}
        />
        <FormRow
          label="Copy link"
          leading={<FormRow.Icon source={getAssetIDByName("copy")} />}
          onPress={() => {
            clipboard.setString(rebuildLink(song.service, song.type, song.id));
            showToast("Copied", getAssetIDByName("toast_copy_link"));
            hideActionSheet();
          }}
        />
        <FormRow
          label={<SimpleText {...destructiveText}>Remove song</SimpleText>}
          leading={
            <FormRow.Icon
              style={styles.destructiveIcon}
              source={getAssetIDByName("trash")}
            />
          }
          onPress={() => {
            remove();
            showToast("Removed", getAssetIDByName("toast_trash"));
            hideActionSheet();
          }}
        />
      </ActionSheetContentContainer>
    </ActionSheet>
  );
}
