import { stylesheet } from "@vendetta/metro/common";
import { semanticColors } from "@vendetta/ui";
import { General } from "@vendetta/ui/components";

const { View } = General;

export default function LineDivider({ addPadding }: { addPadding?: boolean }) {
  const styles = stylesheet.createThemedStyleSheet({
    line: {
      width: "100%",
      height: 2,
      backgroundColor: semanticColors.BACKGROUND_ACCENT,
      borderRadius: 2147483647,
    },
  });

  return (
    <View
      style={[
        { marginTop: 16, marginBottom: 16 },
        addPadding && { marginHorizontal: 16 },
      ]}
    >
      <View style={styles.line} />
    </View>
  );
}
