import { React, stylesheet } from "@vendetta/metro/common";
import { after } from "@vendetta/patcher";
import { semanticColors } from "@vendetta/ui";
import { General } from "@vendetta/ui/components";

import { FadeView } from "../../../../stuff/animations";
import { SimpleText, TextStyleSheet } from "../../../../stuff/types";
import { vstorage } from "..";
import getMessageLength, { display, hasSLM } from "../stuff/getMessageLength";
import { lastText } from "../stuff/patcher";

const { View, Pressable } = General;

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
});

export default ({ inputProps }: { inputProps: any }) => {
  const [isToggled, setIsToggled] = React.useState(false);
  const [text, setText] = React.useState("");

  lastText.value = text;
  after("onChangeText", inputProps, ([txt]: [string]) => setText(txt), true);

  const curLength = text.length,
    maxLength = getMessageLength();
  const extraMessages = hasSLM() ? Math.floor(curLength / maxLength) : 0;
  const dspLength = curLength - extraMessages * maxLength;

  const elY = styles.text.fontSize * 2 + styles.text.paddingVertical;

  const shouldAppear = curLength >= (vstorage.minChars ?? 1);
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
          {display(dspLength)}
        </SimpleText>
      </UseComponent>
    </FadeView>
  );
};
