import { getAssetIDByName } from "@vendetta/ui/assets";
import { showToast } from "@vendetta/ui/toasts";
import { ActionSheetRow, hideActionSheet } from "../../../../stuff/types";
import { addPin, hasPin, removePin } from "..";
import { ReactNative as RN, stylesheet } from "@vendetta/metro/common";
import { semanticColors } from "@vendetta/ui";

export default function (message: {
  channel_id: string;
  id: string;
  author: { globalName?: string; username: string };
  nick?: string;
}) {
  const isPinned = hasPin(message.channel_id, message.id);
  const styles = stylesheet.createThemedStyleSheet({
    iconComponent: {
      width: 24,
      height: 24,
      tintColor: semanticColors.INTERACTIVE_NORMAL,
    },
  });

  return (
    <ActionSheetRow
      label={isPinned ? "Unpin Message Locally" : "Pin Message Locally"}
      icon={
        <ActionSheetRow.Icon
          source={getAssetIDByName("ic_message_pin")}
          IconComponent={() => (
            <RN.Image
              resizeMode="cover"
              style={styles.iconComponent}
              source={getAssetIDByName("ic_message_pin")}
            />
          )}
        />
      }
      onPress={() => {
        if (isPinned) {
          removePin(message.channel_id, message.id);
          showToast(
            `Unpinned ${
              message.nick ??
              message.author.globalName ??
              message.author.username
            }'s message locally`,
            getAssetIDByName("ic_message_pin")
          );
        } else {
          addPin(message.channel_id, message.id);
          showToast(
            `Pinned ${
              message.nick ??
              message.author.globalName ??
              message.author.username
            }'s message locally`,
            getAssetIDByName("ic_message_pin")
          );
        }
        hideActionSheet();
      }}
    />
  );
}
