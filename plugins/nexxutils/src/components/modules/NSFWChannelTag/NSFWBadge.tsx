import { stylesheet } from "@vendetta/metro/common";
import { semanticColors } from "@vendetta/ui";
import { General } from "@vendetta/ui/components";

import { SimpleText } from "../../../../../../stuff/types";

const { View } = General;

const styles = stylesheet.createThemedStyleSheet({
  main: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 2147483647,
    justifyContent: "center",
    alignItems: "center",
    height: 16,
    overflow: "hidden",
    backgroundColor: semanticColors.STATUS_DANGER_BACKGROUND,
    marginLeft: 8,
  },
});

export default function NSFWBadge({ padding }: { padding: boolean }) {
  return (
    <View style={[styles.main, padding && { marginRight: 4 }]}>
      <SimpleText
        variant="text-xs/bold"
        color="STATUS_DANGER_TEXT"
        align="center"
        style={{ marginTop: -2 }}
      >
        NSFW
      </SimpleText>
    </View>
  );
}
