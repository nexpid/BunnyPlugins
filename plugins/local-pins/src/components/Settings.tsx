import { Forms, General } from "@vendetta/ui/components";
import { BetterTableRowGroup, SimpleText } from "../../../../stuff/types";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { vstorage } from "..";
import { stylesheet } from "@vendetta/metro/common";
import { semanticColors } from "@vendetta/ui";
import { showConfirmationAlert } from "@vendetta/ui/alerts";
import { useProxy } from "@vendetta/storage";

const { ScrollView } = General;
const { FormRow } = Forms;

const styles = stylesheet.createThemedStyleSheet({
  destructiveIcon: {
    tintColor: semanticColors.TEXT_DANGER,
  },
});
const destructiveText: Parameters<typeof SimpleText>[0] = {
  color: "TEXT_DANGER",
  variant: "text-md/semibold",
};

export default () => {
  useProxy(vstorage);

  return (
    <ScrollView>
      <BetterTableRowGroup
        title="Settings"
        icon={getAssetIDByName("ic_cog_24px")}
      >
        <FormRow
          label="Data size"
          subLabel={
            vstorage.pinned
              ? `${
                  Math.floor(
                    (JSON.stringify(vstorage.pinned).length / 1000) * 100
                  ) / 100
                } kilobytes`
              : "N/A"
          }
          leading={
            <FormRow.Icon source={getAssetIDByName("ic_message_edit")} />
          }
        />
        <FormRow
          label={<SimpleText {...destructiveText}>Clear data</SimpleText>}
          leading={
            <FormRow.Icon
              style={styles.destructiveIcon}
              source={getAssetIDByName("ic_message_delete")}
            />
          }
          trailing={<FormRow.Arrow />}
          onPress={() =>
            showConfirmationAlert({
              title: "Clear data",
              content: "Are you sure you want to clear all local pin data?",
              confirmText: "Clear",
              confirmColor: "red" as ButtonColors,
              onConfirm: () => {
                delete vstorage.pinned;
              },
              isDismissable: true,
            })
          }
        />
      </BetterTableRowGroup>
    </ScrollView>
  );
};
