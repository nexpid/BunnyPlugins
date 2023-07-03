import {
  moment,
  React,
  ReactNative as RN,
  stylesheet,
} from "@vendetta/metro/common";
import { showConfirmationAlert } from "@vendetta/ui/alerts";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { General } from "@vendetta/ui/components";
import { semanticColors } from "@vendetta/ui";
import { FadeView } from "../../../../stuff/animations";
import { findByName, findByProps, findByStoreName } from "@vendetta/metro";
import { before, instead } from "@vendetta/patcher";

const { Pressable } = General;

const { default: renderMessageMarkup } = findByProps(
  "renderMessageMarkupToAST"
);
const MessagePreview = findByName("MessagePreview", false);
const UserStore = findByStoreName("UserStore");
const SelectedChannelStore = findByStoreName("SelectedChannelStore");

export default ({
  thing,
}: {
  thing: { runner: (txt: string) => void };
}): React.JSX.Element => {
  const size = 40;
  const styles = stylesheet.createThemedStyleSheet({
    androidRipple: {
      color: semanticColors.ANDROID_RIPPLE,
      cornerRadius: 2147483647,
    },
    actionButton: {
      borderRadius: 2147483647,
      height: size,
      width: size,
      marginHorizontal: 4,
      flexShrink: 0,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: semanticColors.BACKGROUND_SECONDARY,

      marginLeft: 8,
      marginTop: -4,
    },
    actionIcon: {
      tintColor: semanticColors.INTERACTIVE_NORMAL,
      width: size * 0.6,
      height: size * 0.6,
    },
  });

  const [text, setText] = React.useState("");
  thing.runner = (txt) => setText(txt);

  const run = () => {
    const markup = renderMessageMarkup(
      {
        content: text,
        embeds: [],
      },
      {
        hideSimpleEmbedContent: true,
        formatInline: false,
        allowHeading: true,
        allowList: true,
        allowLinks: false,
        previewLinkTarget: false,
      }
    ).content;

    /*before(
      "default",
      MessagePreview,
      ([thing]) => {
        console.log("did thing :3");
        return [thing, {}];
      },
      true
    );
    instead(
      "hasClydeAiThoughtsEmbed",
      findByProps("hasClydeAiThoughtsEmbed"),
      () => false,
      true
    );

    const channel = SelectedChannelStore.getChannelId();*/

    showConfirmationAlert({
      title: "Markdown Preview",
      content: markup,
      /*content: (
        <MessagePreview.default
          massage={{
            id: "1125085582033436692",
            type: 0,
            channel_id: channel,
            getChannelId: () => channel,
            author: UserStore.getCurrentUser(),
            content: text,
            attachments: [],
            embeds: [],
            mentions: [],
            mentionRoles: [],
            mentionChannels: [],
            mentioned: false,
            pinned: false,
            mentionEveryone: false,
            tts: false,
            codedLinks: [],
            giftCodes: [],
            state: "SENT",
            blocked: false,
            bot: false,
            reactions: [],
            flags: 0,
            isSearchHit: false,
            stickers: [],
            stickerItems: [],
            components: [],
            nick: "byte",
            timestamp: moment(),
          }}
        />
      ),*/
      confirmText: "Ok",
      confirmColor: "grey" as ButtonColors,
      onConfirm: () => undefined,
    });
  };

  return (
    <FadeView
      style={{
        flexDirection: "row",
        position: "absolute",
        left: 0,
        top: -size,
        zIndex: 3,
      }}
      duration={100}
      fade={text.length > 0 ? "in" : "out"}
    >
      <Pressable
        android_ripple={styles.androidRipple}
        disabled={false}
        accessibilityRole={"button"}
        accessibilityState={{
          disabled: false,
          expanded: false,
        }}
        accessibilityLabel="Open markdown preview"
        accessibilityHint="Open a modal which shows your message's markdown preview"
        onPress={run}
        style={styles.actionButton}
        children={
          <RN.Image
            style={styles.actionIcon}
            source={getAssetIDByName("ic_eye")}
          />
        }
      />
    </FadeView>
  );
};
