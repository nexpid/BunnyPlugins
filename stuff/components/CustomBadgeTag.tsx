import { stylesheet } from "@vendetta/metro/common";
import { semanticColors } from "@vendetta/ui";
import { General } from "@vendetta/ui/components";
import { SimpleText } from "../types";

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

export default function ({
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
        <SimpleText variant="eyebrow" color="TEXT_NORMAL">
          {text}
        </SimpleText>
      </View>
    </View>
  );
}
