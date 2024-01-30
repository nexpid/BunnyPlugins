import { useProxy } from "@vendetta/storage";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { Forms, General } from "@vendetta/ui/components";

import { BetterTableRowGroup } from "$/components/BetterTableRow";
import { openSheet } from "$/types";

import { vstorage } from "..";
import { emojipacks } from "../stuff/twemoji";
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
