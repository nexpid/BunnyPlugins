import { stylesheet } from "@vendetta/metro/common";
import { semanticColors } from "@vendetta/ui";
import { General } from "@vendetta/ui/components";

import { TextStyleSheet } from "$/types";

import { lang } from "..";

const { View, Text } = General;

const styles = stylesheet.createThemedStyleSheet({
  count: {
    ...TextStyleSheet["text-lg/bold"],
    color: semanticColors.TEXT_NORMAL,
    textAlign: "center",
  },
  subtitle: {
    ...TextStyleSheet["text-md/medium"],
    color: semanticColors.TEXT_MUTED,
    textAlign: "center",
  },
});

export default function ({
  subtitle,
  count,
}: {
  subtitle: keyof typeof lang.Values;
  count: string | number;
}) {
  return (
    <View
      style={{
        alignItems: "center",
        justifyContent: "center",
        marginHorizontal: 16,
      }}
    >
      <Text style={styles.count}>{count}</Text>
      <Text style={styles.subtitle}>{lang.format(subtitle, {})}</Text>
    </View>
  );
}
