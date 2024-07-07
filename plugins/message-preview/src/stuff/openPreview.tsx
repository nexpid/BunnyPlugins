import { findByName, findByProps, findByStoreName } from "@vendetta/metro";
import { ReactNative as RN } from "@vendetta/metro/common";
import { showConfirmationAlert } from "@vendetta/ui/alerts";

import { vstorage } from "..";

const { default: ChatItemWrapper } = findByProps(
  "DCDAutoModerationSystemMessageView",
  "default",
);
const MessageRecord = findByName("MessageRecord");
const RowManager = findByName("RowManager");
const SelectedChannelStore = findByStoreName("SelectedChannelStore");
const UserStore = findByStoreName("UserStore");

const { receiveMessage } = findByProps("receiveMessage");
const { createBotMessage } = findByProps("createBotMessage");

const { getText } = findByProps("openSystemKeyboard", "getText");

export default function () {
  const text = getText(SelectedChannelStore.getChannelId());
  if (text.trim() === "") return;

  if (vstorage.previewType === "popup")
    showConfirmationAlert({
      title: "Message Preview",
      onConfirm: () => void 0,
      // @ts-expect-error -- a valid property that's unadded in typings
      children: (
        <RN.ScrollView
          style={{
            marginVertical: 12,
            maxHeight: RN.Dimensions.get("window").height * 0.7,
          }}
        >
          <ChatItemWrapper
            rowGenerator={new RowManager()}
            message={
              new MessageRecord({
                id: "0",
                channel_id: SelectedChannelStore.getChannelId(),
                author: UserStore.getCurrentUser(),
                content: text,
              })
            }
          />
        </RN.ScrollView>
      ),
    });
  else {
    const channel = SelectedChannelStore.getChannelId();
    const author = UserStore.getCurrentUser();

    return receiveMessage(
      channel,
      Object.assign(
        createBotMessage({
          channelId: channel,
          content: text,
        }),
        {
          author,
        },
      ),
    );
  }
}
