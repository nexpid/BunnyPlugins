import { findByProps } from "@vendetta/metro";
import { storage } from "@vendetta/plugin";
import { useProxy } from "@vendetta/storage";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { Forms, General } from "@vendetta/ui/components";
import { showToast } from "@vendetta/ui/toasts";

export const vstorage = storage as Record<
  "reactions" | "superreactions" | "ignorebotreactions",
  boolean | undefined
>;

const { ScrollView, View } = General;
const { FormSwitchRow, FormIcon, FormDivider, FormRow } = Forms;
const { TableRowGroup } = findByProps("TableRowGroup");

export default () => {
  useProxy(vstorage);

  vstorage.reactions ??= true;
  vstorage.superreactions ??= true;
  vstorage.ignorebotreactions ??= true;

  return (
    <ScrollView>
      <View style={{ marginTop: 16, marginHorizontal: 16 }}>
        <View style={{ marginBottom: 16 }}>
          <TableRowGroup>
            <FormSwitchRow
              label="Normal Reactions"
              subLabel="Get notifications about normal reactions your messages receive"
              leading={
                <FormIcon source={getAssetIDByName("ic_add_reaction_v2")} />
              }
              onValueChange={() => (vstorage.reactions = !vstorage.reactions)}
              value={vstorage.reactions}
            />
            <FormDivider />
            <FormSwitchRow
              label="Super Reactions"
              subLabel="Get notifications about super reactions your messages receive"
              leading={
                <FormIcon source={getAssetIDByName("ic_add_super_reaction")} />
              }
              onValueChange={() =>
                (vstorage.superreactions = !vstorage.superreactions)
              }
              value={vstorage.superreactions}
            />
            <FormDivider />
            <FormSwitchRow
              label="Ignore Bot Reactions"
              subLabel="Ignore when a bot reacts to your message"
              leading={<FormIcon source={getAssetIDByName("ic_robot_24px")} />}
              onValueChange={() =>
                (vstorage.ignorebotreactions = !vstorage.ignorebotreactions)
              }
              value={vstorage.ignorebotreactions}
            />
          </TableRowGroup>
        </View>
        <View style={{ marginBottom: 16 }}>
          <TableRowGroup>
            <FormRow
              label="test notification"
              onPress={() => {
                showToast("not implemented yet", getAssetIDByName("Small"));
              }}
            />
          </TableRowGroup>
        </View>
      </View>
    </ScrollView>
  );
};
