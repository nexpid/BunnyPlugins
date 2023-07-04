import {
  React,
  ReactNative,
  ReactNative as RN,
  stylesheet,
} from "@vendetta/metro/common";
import { showConfirmationAlert } from "@vendetta/ui/alerts";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { General } from "@vendetta/ui/components";
import { semanticColors } from "@vendetta/ui";
import { FadeView } from "../../../../stuff/animations";
import { findByName, findByProps, findByStoreName } from "@vendetta/metro";
import { after } from "@vendetta/patcher";

const { ScrollView, Pressable } = General;

const ACTION_ICON_SIZE = 40;
const styles = stylesheet.createThemedStyleSheet({
  androidRipple: {
    color: semanticColors.ANDROID_RIPPLE,
    cornerRadius: 2147483647,
  },
  actionButton: {
    borderRadius: 2147483647,
    height: ACTION_ICON_SIZE,
    width: ACTION_ICON_SIZE,
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
    width: ACTION_ICON_SIZE * 0.6,
    height: ACTION_ICON_SIZE * 0.6,
  },
});

const { default: ChatItemWrapper } = findByProps("DCDAutoModerationSystemMessageView");
const MessageRecord = findByName("MessageRecord");
const RowManager = findByName("RowManager");
const SelectedChannelStore = findByStoreName("SelectedChannelStore");
const UserStore = findByStoreName("UserStore");

export default ({ inputProps }): JSX.Element => {
  const textRef = React.useRef<string>(null);

  if (!inputProps.onChangeText) {
    inputProps.onChangeText = (text: string) => textRef.current = text;
  } else {
    after(
      "onChangeText",
      inputProps,
      ([text]: [string]) => textRef.current = text,
      true
    );
  }

  const onPress = () => {
    showConfirmationAlert({
      title: "Message Preview",
      onConfirm: () => void 0,
      // @ts-ignore -- a valid property that's unadded in typings
      children: (
        <ScrollView style={{
          marginVertical: 12,
          maxHeight: ReactNative.Dimensions.get('window').height * 0.7,
        }}>
          <ChatItemWrapper
            rowGenerator={new RowManager}
            message={new MessageRecord({
              id: "0",
              channel_id: SelectedChannelStore.getChannelId(),
              author: UserStore.getCurrentUser(),
              content: textRef.current
            })}
          />
        </ScrollView>
      )
    });
  };

  return (
    <FadeView
      style={{
        flexDirection: "row",
        position: "absolute",
        left: 0,
        top: -ACTION_ICON_SIZE,
        zIndex: 3,
      }}
      duration={100}
      fade={textRef.current?.length > 0 ? "in" : "out"}
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
        onPress={onPress}
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
