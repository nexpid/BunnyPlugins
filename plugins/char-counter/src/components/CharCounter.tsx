import { React, stylesheet } from "@vendetta/metro/common";
import { General } from "@vendetta/ui/components";
import getMessageLength, { prettify } from "../stuff/getMessageLength";
import { findByProps } from "@vendetta/metro";
import { semanticColors } from "@vendetta/ui";

const { TextStyleSheet } = findByProps("TextStyleSheet");
const { Text, View } = General;
const styles = stylesheet.createThemedStyleSheet({
  text: {
    ...TextStyleSheet["text-xs/semibold"],
    backgroundColor: semanticColors.BACKGROUND_TERTIARY,
    borderRadius: 8,
    textAlign: "right",
    marginRight: 8,
    marginTop: -4,
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
    <View
      style={{
        flexDirection: "row-reverse",
        position: "absolute",
        right: 0,
        top: -elY,
      }}
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
    </View>
  );
};
