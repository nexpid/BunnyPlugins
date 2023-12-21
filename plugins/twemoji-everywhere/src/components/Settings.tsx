import { Forms, General } from "@vendetta/ui/components";
import { BetterTableRowGroup, openSheet } from "../../../../stuff/types";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { emojipacks } from "../stuff/twemoji";
import { vstorage } from "..";
import { useProxy } from "@vendetta/storage";
import EmojiPackActionSheet from "./sheets/EmojiPackActionSheet";

const { ScrollView } = General;
const { FormRow } = Forms;

export default () => {
  vstorage.emojipack ??= "default";
  useProxy(vstorage);

  return (
    <ScrollView>
      <BetterTableRowGroup
        title="Settings"
        icon={getAssetIDByName("ic_cog_24px")}
      >
        <FormRow
          label="Emoji pack"
          subLabel={emojipacks[vstorage.emojipack]?.title ?? "N/A"}
          leading={
            <FormRow.Icon source={getAssetIDByName("ic_message_edit")} />
          }
          trailing={<FormRow.Arrow />}
          onPress={() =>
            openSheet(EmojiPackActionSheet, { called: Date.now() })
          }
        />
      </BetterTableRowGroup>
    </ScrollView>
  );
};
