import { Forms, General } from "@vendetta/ui/components";
import { BetterTableRowGroup } from "../../../../stuff/types";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { vstorage } from "..";
import { useProxy } from "@vendetta/storage";

const { ScrollView } = General;
const { FormRow, FormRadioRow } = Forms;

export default function (): React.JSX.Element {
  vstorage.buttonType ??= "pill";
  vstorage.previewType ??= "popup";
  useProxy(vstorage);

  return (
    <ScrollView>
      <BetterTableRowGroup title="Settings" icon={getAssetIDByName("ic_cog")}>
        <FormRow
          label="Button type"
          leading={
            <FormRow.Icon source={getAssetIDByName("ic_message_edit")} />
          }
        />
        <FormRadioRow
          label="Floating Pill"
          onPress={() => (vstorage.buttonType = "pill")}
          trailing={<FormRow.Arrow />}
          selected={vstorage.buttonType === "pill"}
          style={{ marginHorizontal: 12 }}
        />
        <FormRadioRow
          label="Send button"
          subLabel="Holding the seld button"
          onPress={() => (vstorage.buttonType = "send")}
          trailing={<FormRow.Arrow />}
          selected={vstorage.buttonType === "send"}
          style={{ marginHorizontal: 12 }}
        />
        <FormRow
          label="Preview type"
          leading={
            <FormRow.Icon source={getAssetIDByName("ic_message_edit")} />
          }
        />
        <FormRadioRow
          label="Popup"
          onPress={() => (vstorage.previewType = "popup")}
          trailing={<FormRow.Arrow />}
          selected={vstorage.previewType === "popup"}
          style={{ marginHorizontal: 12 }}
        />
        <FormRadioRow
          label="Ephemeral message"
          onPress={() => (vstorage.previewType = "clyde")}
          trailing={<FormRow.Arrow />}
          selected={vstorage.previewType === "clyde"}
          style={{ marginHorizontal: 12 }}
        />
      </BetterTableRowGroup>
    </ScrollView>
  );
}
