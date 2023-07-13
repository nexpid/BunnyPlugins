import { React, stylesheet } from "@vendetta/metro/common";
import { General } from "@vendetta/ui/components";
import getMessageLength, { hasSLM, prettify } from "../stuff/getMessageLength";
import { findByProps } from "@vendetta/metro";
import { semanticColors } from "@vendetta/ui";
import { FadeView } from "../../../../stuff/animations";
import { after } from "@vendetta/patcher";
import { SimpleText } from "../../../../stuff/types";

const { Text, View, Pressable } = General;

const { TextStyleSheet } = findByProps("TextStyleSheet");

const xsFontSize = TextStyleSheet["text-xs/semibold"].fontSize;
const styles = stylesheet.createThemedStyleSheet({
  androidRipple: {
    color: semanticColors.ANDROID_RIPPLE,
    cornerRadius: 8,
  },
  container: {
    backgroundColor: semanticColors.BACKGROUND_TERTIARY,
    borderRadius: 8,
    marginRight: 8,
    marginTop: -12,
  },
  text: {
    ...TextStyleSheet["text-xs/semibold"],
    textAlign: "right",
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  extraMessagesCircle: {
    backgroundColor: semanticColors.REDESIGN_BUTTON_PRIMARY_BACKGROUND,
    borderRadius: 2147483647,
    position: "absolute",
    left: 0,
    top: 0,
    transform: [
      {
        translateX: -xsFontSize,
      },
      {
        translateY: -xsFontSize,
      },
    ],
    minWidth: xsFontSize * 2,
    height: xsFontSize * 2,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
  },
  normal: {
    color: semanticColors.TEXT_NORMAL,
  },
  jinkies: {
    color: semanticColors.TEXT_DANGER,
  },
});

export default ({ inputProps }: { inputProps: any }): React.JSX.Element => {
  const [isToggled, setIsToggled] = React.useState(false);
  const textRef = React.useRef<string>(null);

  if (!inputProps.onChangeText) {
    inputProps.onChangeText = (text: string) => (textRef.current = text);
  } else {
    after(
      "onChangeText",
      inputProps,
      ([text]: [string]) => (textRef.current = text),
      true
    );
  }

  const curLength = textRef.current?.length ?? 0,
    maxLength = getMessageLength();
  const extraMessages = hasSLM() ? Math.floor(curLength / maxLength) : 0;
  const dspLength = curLength - extraMessages * maxLength;

  const elY = styles.text.fontSize * 2 + styles.text.paddingVertical;

  const shouldAppear = curLength > 0;
  const UseComponent = shouldAppear ? Pressable : View;

  return (
    <FadeView
      duration={100}
      style={{
        flexDirection: "row-reverse",
        position: "absolute",
        right: 0,
        top: -elY,
        zIndex: 1,
      }}
      fade={shouldAppear ? "in" : "out"}
      customOpacity={isToggled && shouldAppear ? 0.3 : undefined}
    >
      <UseComponent
        android_ripple={styles.androidRipple}
        disabled={false}
        accessibilityRole={"button"}
        accessibilityState={{
          disabled: false,
          expanded: false,
        }}
        accessibilityLabel="Character counter"
        accessibilityHint="Tap to toggle character counter translucency"
        style={styles.container}
        onPress={shouldAppear ? () => setIsToggled(!isToggled) : undefined}
      >
        <FadeView
          fade={extraMessages > 0 && shouldAppear ? "in" : "out"}
          duration={100}
          style={styles.extraMessagesCircle}
        >
          <SimpleText
            variant="text-xs/semibold"
            color="TEXT_NORMAL"
            style={{ paddingHorizontal: xsFontSize / 2 }}
          >
            {extraMessages}
          </SimpleText>
        </FadeView>
        <SimpleText
          variant="text-xs/semibold"
          color={dspLength <= maxLength ? "TEXT_NORMAL" : "TEXT_DANGER"}
          style={{
            paddingHorizontal: 8,
            paddingVertical: 8,
          }}
        >
          {prettify(dspLength)}/{prettify(maxLength)}
        </SimpleText>
      </UseComponent>
    </FadeView>
  );
};
