import { getAssetIDByName } from "@vendetta/ui/assets";
import { Module, ModuleCategory } from "../stuff/Module";
import { before } from "@vendetta/patcher";
import { findByProps, findByStoreName } from "@vendetta/metro";
import { ReactNative as RN, React, i18n } from "@vendetta/metro/common";
import { resolveSemanticColor } from "../../../../stuff/types";
import { semanticColors } from "@vendetta/ui";

const SpotifyStore = findByStoreName("SpotifyStore");
const SelectedChannelStore = findByStoreName("SelectedChannelStore");
const Button = findByProps("ButtonText");

const { sendMessage } = findByProps("sendMessage", "revealMessage");
const { getText, setText } = findByProps(
  "openSystemKeyboard",
  "getText",
  "setText"
);

const sendInvite = () => {
  const activity = SpotifyStore.getActivity();
  if (!activity?.party?.id) return;

  const channel = SelectedChannelStore.getChannelId();
  sendMessage(
    channel,
    {
      content: getText(channel),
      tts: false,
      invalidEmojis: [],
      validNonShortcutEmojis: [],
    },
    true,
    {
      activityAction: {
        activity,
        type: 3,
      },
    }
  );
  setText(channel, "");
};

export default new Module({
  id: "send-spotify-invite",
  label: "Send Spotify invite",
  sublabel: "Adds an option to send a Spotify Listen Along invite in chat",
  category: ModuleCategory.Useful,
  icon: getAssetIDByName("ic_spotify_white_16px"),
  handlers: {
    onStart() {
      this.patches.add(
        before("default", Button, (args) => {
          const cloned = [...args];
          const x = cloned[0];

          if (x.text === i18n.Messages.CAMERA) {
            const disabled = !SpotifyStore.getActivity()?.party?.id;

            x.text = "Send Spotify invite";
            x.accessibilityLabel = "Send Spotify invite";
            x.renderIcon = () =>
              React.createElement(RN.Image, {
                source: getAssetIDByName("ic_spotify_white_16px"),
                style: {
                  width: 20,
                  height: 20,
                  tintColor: resolveSemanticColor(
                    disabled
                      ? semanticColors.INTERACTIVE_MUTED
                      : semanticColors.INTERACTIVE_NORMAL
                  ),
                  marginRight: 8,
                },
              });
            x.onPress = sendInvite;
            x.disabled = disabled;
          }

          return cloned;
        })
      );
    },
    onStop() {},
  },
});
