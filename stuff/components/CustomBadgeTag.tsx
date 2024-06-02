import { stylesheet } from "@vendetta/metro/common";
import { semanticColors } from "@vendetta/ui";
import { General } from "@vendetta/ui/components";

import Text from "./Text";

const { View } = General;
const styles = stylesheet.createThemedStyleSheet({
  main: {
    marginRight: 16,
    flexGrow: 0,
  },
  content: {
    backgroundColor: semanticColors.REDESIGN_BUTTON_PRIMARY_BACKGROUND,
    borderRadius: 16,
    marginLeft: 8,
    paddingHorizontal: 8,
  },
});

export default function CustomBadgeTag({
  text,
  marginLeft,
}: {
  text: string;
  marginLeft?: boolean;
}) {
  return (
    <View
      style={[
        styles.main,
        marginLeft ? { marginLeft: 16, marginRight: 0 } : {},
      ]}
    >
      <View style={styles.content}>
        <Text variant="eyebrow" color="TEXT_NORMAL">
          {text}
        </Text>
      </View>
    </View>
  );
}
