import { React, stylesheet } from "@vendetta/metro/common";
import { General } from "@vendetta/ui/components";
import getMessageLength, { stringify } from "../stuff/getMessageLength";
import { findByProps } from "@vendetta/metro";
import { semanticColors } from "@vendetta/ui";

const { TextStyleSheet } = findByProps("TextStyleSheet");
const { Text } = General;
const styles = stylesheet.createThemedStyleSheet({
  text: {
    ...TextStyleSheet["text-sm/semibold"],
    textAlign: "right",
    marginRight: 8,
    marginBottom: 4,
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

  return (
    <Text
      style={{
        ...styles.text,
        color:
          curLength <= maxLength ? styles.normal.color : styles.jinkies.color,
      }}
    >
      {curLength}/{stringify(maxLength)}
    </Text>
  );
};
