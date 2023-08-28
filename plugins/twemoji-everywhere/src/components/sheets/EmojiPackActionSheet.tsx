import { Forms } from "@vendetta/ui/components";
import {
  ActionSheet,
  ActionSheetCloseButton,
  ActionSheetContentContainer,
  ActionSheetTitleHeader,
  Entries,
  hideActionSheet,
} from "../../../../../stuff/types";
import { emojipacks } from "../../stuff/twemoji";
import { vstorage } from "../..";
import { useProxy } from "@vendetta/storage";

const { FormRadioRow } = Forms;

export default ({}) => {
  vstorage.emojipack ??= "default";
  useProxy(vstorage);

  return (
    <ActionSheet>
      <ActionSheetContentContainer>
        <ActionSheetTitleHeader
          title="Emoji Pack"
          trailing={
            <ActionSheetCloseButton onPress={() => hideActionSheet()} />
          }
        />
        {Object.entries(emojipacks).map(
          ([id, info]: Entries<typeof emojipacks>) => (
            <FormRadioRow
              label={info.title}
              onPress={() => (vstorage.emojipack = id)}
              selected={vstorage.emojipack === id}
            />
          )
        )}
      </ActionSheetContentContainer>
    </ActionSheet>
  );
};
