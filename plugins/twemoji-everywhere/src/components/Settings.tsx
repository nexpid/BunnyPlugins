import { useProxy } from "@vendetta/storage";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { Forms, General } from "@vendetta/ui/components";

import { BetterTableRowGroup } from "$/components/BetterTableRow";
import SimpleText from "$/components/SimpleText";
import { openSheet } from "$/types";

import { lang, vstorage } from "..";
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
        title={lang.format("settings.title", {})}
        icon={getAssetIDByName("ic_cog_24px")}
      >
        <FormRow
          label={lang.format("settings.emojipacks.title", {})}
          leading={
            <FormRow.Icon source={getAssetIDByName("ic_message_edit")} />
          }
          trailing={
            <SimpleText variant="text-md/medium" color="TEXT_MUTED">
              {emojipacks[vstorage.emojipack]
                ? lang.format(emojipacks[vstorage.emojipack].title, {})
                : "-"}
            </SimpleText>
          }
          onPress={() =>
            openSheet(EmojiPackActionSheet, { called: Date.now() })
          }
        />
      </BetterTableRowGroup>
    </ScrollView>
  );
};
