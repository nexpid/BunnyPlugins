import { findByProps } from "@vendetta/metro";
import { stylesheet } from "@vendetta/metro/common";
import { semanticColors } from "@vendetta/ui";
import { General } from "@vendetta/ui/components";

const { View, Text } = General;

const { TextStyleSheet } = findByProps("TextStyleSheet");
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
  contents,
}: {
  subtitle: string;
  count: string | number;
  contents: number;
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
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
}
