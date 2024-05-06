import { stylesheet } from "@vendetta/metro/common";
import { semanticColors } from "@vendetta/ui";
import { General } from "@vendetta/ui/components";

import Text from "$/components/Text";

const { View } = General;

const styles = stylesheet.createThemedStyleSheet({
  main: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 2147483647,
    paddingHorizontal: 6,
    paddingVertical: 3,
    backgroundColor: semanticColors.STATUS_DANGER_BACKGROUND,
  },
});

export default function NSFWBadge() {
  return (
    <View style={styles.main}>
      <Text
        variant="text-xxs/bold"
        color="STATUS_DANGER_TEXT"
        align="center"
        style={{
          textTransform: "uppercase",
        }}
      >
        nsfw
      </Text>
    </View>
  );
}
