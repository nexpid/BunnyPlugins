import { stylesheet } from "@vendetta/metro/common";
import { semanticColors } from "@vendetta/ui";
import { General } from "@vendetta/ui/components";
import { SimpleText } from "../../../../stuff/types";

const { View, Pressable } = General;

export default ({
  title,
  color,
}: {
  title: string;
  color: string;
}): React.JSX.Element => {
  const styles = stylesheet.createThemedStyleSheet({
    androidRipple: {
      color: semanticColors.ANDROID_RIPPLE,
      cornerRadius: 2147483647,
    },
  });

  return (
    <View
      style={{
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Pressable
        android_ripple={styles.androidRipple}
        disabled={false}
        accessibilityRole={"button"}
        accessibilityState={{
          disabled: false,
          expanded: false,
        }}
        accessibilityLabel={`${title} Color Preview`}
        accessibilityHint={`Shows the ${title} color used in this theme`}
        style={{
          width: 48,
          aspectRatio: 1,
          backgroundColor: color,
          borderRadius: 2147483647,
          marginBottom: 8,
          marginHorizontal: 10,
        }}
        onPress={() => {}}
      />
      <SimpleText variant="text-md/semibold" color="TEXT_NORMAL">
        {title}
      </SimpleText>
    </View>
  );
};
