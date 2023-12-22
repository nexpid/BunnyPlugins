import { React } from "@vendetta/metro/common";
import { useProxy } from "@vendetta/storage";
import { Forms } from "@vendetta/ui/components";

import {
  ActionSheet,
  ActionSheetCloseButton,
  ActionSheetContentContainer,
  ActionSheetTitleHeader,
  Entries,
  hideActionSheet,
} from "../../../../../stuff/types";
import { vstorage } from "../..";
import { convert, emojipacks } from "../../stuff/twemoji";
import CustomTwemoji from "../CustomTwemoji";

const { FormRow } = Forms;

const emojis = Array.from("😀😁😂🤣😃😄😅😆😋😊😉😎😍😘🥰😗");

export default ({ called }: { called: number }) => {
  vstorage.emojipack ??= "default";
  useProxy(vstorage);

  const emoji = React.useMemo(
    () => convert(emojis[Math.floor(Math.random() * emojis.length)]),
    [called],
  );

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
            <FormRow
              label={info.title}
              trailing={
                <CustomTwemoji
                  emoji={emoji}
                  src={info.format(emoji)}
                  size={20}
                />
              }
              leading={<FormRow.Radio selected={vstorage.emojipack === id} />}
              onPress={() => (vstorage.emojipack = id)}
            />
          ),
        )}
      </ActionSheetContentContainer>
    </ActionSheet>
  );
};
