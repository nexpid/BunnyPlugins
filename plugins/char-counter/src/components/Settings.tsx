import { useProxy } from "@vendetta/storage";
import { vstorage } from "..";
import { Forms, General } from "@vendetta/ui/components";
import { BetterTableRowGroup } from "../../../../stuff/types";
import { getAssetIDByName } from "@vendetta/ui/assets";

const { ScrollView } = General;
const { FormSwitchRow, FormRow } = Forms;

export default () => {
  vstorage.commas ??= true;
  useProxy(vstorage);

  return (
    <ScrollView>
      <BetterTableRowGroup
        title="Settings"
        icon={getAssetIDByName("ic_cog_24px")}
      >
        <FormSwitchRow
          label="Add Thousand Seperators"
          subLabel="Adds thousand seperators (1,234,567) to numbers"
          leading={
            <FormRow.Icon source={getAssetIDByName("ic_message_edit")} />
          }
          onValueChange={() => {
            vstorage.commas = !vstorage.commas;
          }}
          value={vstorage.commas}
        />
      </BetterTableRowGroup>
    </ScrollView>
  );
};
