import { Forms, General } from "@vendetta/ui/components";
import { BetterTableRowGroup } from "../../../../stuff/types";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { useProxy } from "@vendetta/storage";
import { vstorage } from "..";

const { ScrollView } = General;
const { FormRow, FormRadioRow } = Forms;

export default () => {
  vstorage.explodeTime ??= 5;
  vstorage.punishment ??= "crash";
  useProxy(vstorage);

  return (
    <ScrollView>
      <BetterTableRowGroup
        title="Settings"
        icon={getAssetIDByName("ic_cog_24px")}
      >
        <FormRow
          label="Reaction time"
          subLabel="How much time you have to tap the button"
          leading={
            <FormRow.Icon source={getAssetIDByName("ic_message_edit")} />
          }
        />
        <FormRadioRow
          label="3 seconds"
          subLabel="Hard"
          onPress={() => (vstorage.explodeTime = 3)}
          selected={vstorage.explodeTime === 3}
          style={{ marginHorizontal: 12 }}
        />
        <FormRadioRow
          label="5 seconds"
          subLabel="Medium"
          onPress={() => (vstorage.explodeTime = 5)}
          selected={vstorage.explodeTime === 5}
          style={{ marginHorizontal: 12 }}
        />
        <FormRadioRow
          label="10 seconds"
          subLabel="Easy"
          onPress={() => (vstorage.explodeTime = 10)}
          selected={vstorage.explodeTime === 10}
          style={{ marginHorizontal: 12 }}
        />
        <FormRow
          label="Punishment"
          leading={
            <FormRow.Icon source={getAssetIDByName("ic_message_edit")} />
          }
        />
        <FormRadioRow
          label="Crash Discord"
          subLabel="Quick and painless!"
          onPress={() => (vstorage.punishment = "crash")}
          selected={vstorage.punishment === "crash"}
          style={{ marginHorizontal: 12 }}
        />
        <FormRadioRow
          label="Mute for 10s"
          onPress={() => (vstorage.punishment = "mute")}
          selected={vstorage.punishment === "mute"}
          style={{ marginHorizontal: 12 }}
        />
        <FormRadioRow
          label="Log out"
          subLabel="Not recommended lol"
          onPress={() => (vstorage.punishment = "logout")}
          selected={vstorage.punishment === "logout"}
          style={{ marginHorizontal: 12 }}
        />
      </BetterTableRowGroup>
    </ScrollView>
  );
};
