import { useProxy } from "@vendetta/storage";
import { vstorage } from "..";
import { Forms, General } from "@vendetta/ui/components";
import { BetterTableRowGroup } from "../../../../stuff/types";
import { getAssetIDByName } from "@vendetta/ui/assets";

const { ScrollView } = General;
const { FormSwitchRow, FormRadioRow, FormRow, FormInput } = Forms;

export default () => {
  vstorage.position ??= "pill";
  vstorage.commas ??= true;
  vstorage.minChars ??= 1;
  vstorage.supportSLM ??= true;
  useProxy(vstorage);

  return (
    <ScrollView>
      <BetterTableRowGroup
        title="Settings"
        icon={getAssetIDByName("ic_cog_24px")}
      >
        {/*<FormRow
          label="Position"
          subLabel="Choose where Char Counter will appear"
          leading={
            <FormRow.Icon source={getAssetIDByName("ic_message_edit")} />
          }
        />
        <FormRadioRow
          label="Floating Pill"
          onPress={() => (vstorage.position = "pill")}
          trailing={<FormRow.Arrow />}
          selected={vstorage.position === "pill"}
          style={{ marginHorizontal: 12 }}
        />
        <FormRadioRow
          label="Inside Textbox"
          onPress={() => (vstorage.position = "inside")}
          trailing={<FormRow.Arrow />}
          selected={vstorage.position === "inside"}
          style={{ marginHorizontal: 12 }}
        />*/}
        <FormRow
          label="Minimum Characters"
          subLabel="The minimum amount of characters for Char Counter to show up"
          leading={
            <FormRow.Icon source={getAssetIDByName("ic_message_edit")} />
          }
        />
        <FormInput
          title=""
          keyboardType="numeric"
          placeholder="1"
          value={vstorage.minChars.toString()}
          onChange={(x: string) =>
            (vstorage.minChars = Math.max(
              Number.isNaN(Number(x)) ? 1 : Number(x),
              1
            ))
          }
          style={{ marginTop: -25, marginHorizontal: 12 }}
        />
        <FormSwitchRow
          label="Add Thousand Seperators"
          subLabel="Adds thousand seperators (1,234,567) to numbers"
          leading={
            <FormRow.Icon source={getAssetIDByName("ic_message_edit")} />
          }
          onValueChange={() => (vstorage.commas = !vstorage.commas)}
          value={vstorage.commas}
        />
        <FormSwitchRow
          label="Support SplitLargeMessages"
          leading={
            <FormRow.Icon source={getAssetIDByName("ic_message_edit")} />
          }
          onValueChange={() => (vstorage.supportSLM = !vstorage.supportSLM)}
          value={vstorage.supportSLM}
        />
      </BetterTableRowGroup>
    </ScrollView>
  );
};
