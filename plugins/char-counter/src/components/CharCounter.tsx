import { React, stylesheet } from "@vendetta/metro/common";
import { General } from "@vendetta/ui/components";
import getMessageLength, { prettify } from "../stuff/getMessageLength";
import { findByProps } from "@vendetta/metro";
import { semanticColors } from "@vendetta/ui";
import { FadeView } from "../../../../stuff/animations";

const { TextStyleSheet } = findByProps("TextStyleSheet");
const { Text } = General;
const styles = stylesheet.createThemedStyleSheet({
  text: {
    ...TextStyleSheet["text-xs/semibold"],
    backgroundColor: semanticColors.BACKGROUND_TERTIARY,
    borderRadius: 8,
    textAlign: "right",
    marginRight: 8,
    marginTop: -12,
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  normal: {
    color: semanticColors.TEXT_NORMAL,
  },
  jinkies: {
    color: semanticColors.TEXT_DANGER,
  },
});

export default ({
  thing,
}: {
  thing: { runner: (txt: string) => void };
}): React.JSX.Element => {
  const [text, setText] = React.useState("");

  thing.runner = (txt) => setText(txt);

  const curLength = text.length,
    maxLength = getMessageLength();
  const elY = styles.text.fontSize * 2 + styles.text.paddingVertical;

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
      fade={curLength === 0 ? "out" : "in"}
    >
      <Text
        style={{
          ...styles.text,
          color:
            curLength <= maxLength ? styles.normal.color : styles.jinkies.color,
        }}
      >
        {prettify(curLength)}/
        {maxLength !== Infinity ? prettify(maxLength) : "∞"}
      </Text>
    </FadeView>
  );
};
