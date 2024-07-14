import { ReactNative as RN, stylesheet } from "@vendetta/metro/common";
import { semanticColors } from "@vendetta/ui";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { Forms } from "@vendetta/ui/components";
import { showToast } from "@vendetta/ui/toasts";

import { BetterTableRowGroup } from "$/components/BetterTableRow";
import Text from "$/components/Text";

import { lang, vstorage } from "..";

const { FormRow } = Forms;

const styles = stylesheet.createThemedStyleSheet({
  destructiveIcon: {
    tintColor: semanticColors.TEXT_DANGER,
  },
});

export default () => {
  return (
    <RN.ScrollView style={{ flex: 1 }}>
      <BetterTableRowGroup
        title={lang.format("settings.title", {})}
        icon={getAssetIDByName("SettingsIcon")}
      >
        <FormRow
          label={
            <Text color="TEXT_DANGER" variant="text-md/semibold">
              {lang.format("settings.hidden_servers.clear", {})}
            </Text>
          }
          subLabel={
            <Text
              color="TEXT_DANGER"
              variant="text-sm/medium"
              style={{ opacity: 0.5 }}
            >
              {lang.format("settings.hidden_servers.clear.description", {
                servers: vstorage.guilds.length,
                folders: vstorage.folders.length,
              })}
            </Text>
          }
          leading={
            <FormRow.Icon
              style={styles.destructiveIcon}
              source={getAssetIDByName("TrashIcon")}
            />
          }
          trailing={<FormRow.Arrow />}
          onPress={() => {
            vstorage.guilds = [];
            vstorage.folders = [];
            showToast(
              lang.format("toast.cleared_servers", {}),
              getAssetIDByName("TrashIcon"),
            );
          }}
        />
      </BetterTableRowGroup>
    </RN.ScrollView>
  );
};
