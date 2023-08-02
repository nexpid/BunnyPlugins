import { React, ReactNative as RN, stylesheet } from "@vendetta/metro/common";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { General } from "@vendetta/ui/components";
import { semanticColors } from "@vendetta/ui";
import { FadeView } from "../../../../stuff/animations";
import { after } from "@vendetta/patcher";
import { patches } from "../stuff/patcher";
import openPreview from "../stuff/openPreview";

const { Pressable, View } = General;

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
    backgroundColor: semanticColors.BACKGROUND_SECONDARY_ALT,

    marginLeft: 8,
    marginTop: -4,
  },
  actionIcon: {
    tintColor: semanticColors.INTERACTIVE_NORMAL,
    width: ACTION_ICON_SIZE * 0.6,
    height: ACTION_ICON_SIZE * 0.6,
  },
});

export default ({ inputProps }): JSX.Element => {
  const textRef = React.useRef<string>(null);

  if (!inputProps.onChangeText) {
    inputProps.onChangeText = (text: string) => (textRef.current = text);
  } else {
    patches.push(
      after(
        "onChangeText",
        inputProps,
        ([text]: [string]) => (textRef.current = text),
        true
      )
    );
  }

  const shouldAppear = textRef.current?.length > 0;
  const UseComponent = shouldAppear ? Pressable : View;

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
      fade={shouldAppear ? "in" : "out"}
    >
      <UseComponent
        android_ripple={styles.androidRipple}
        disabled={false}
        accessibilityRole={"button"}
        accessibilityState={{
          disabled: false,
          expanded: false,
        }}
        accessibilityLabel="Open markdown preview"
        accessibilityHint="Open a modal which shows your message's markdown preview"
        onPress={shouldAppear ? () => openPreview() : undefined}
        style={styles.actionButton}
      >
        <RN.Image
          style={styles.actionIcon}
          source={getAssetIDByName("ic_eye")}
        />
      </UseComponent>
    </FadeView>
  );
};
