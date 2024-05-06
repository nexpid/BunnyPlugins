import { findByName } from "@vendetta/metro";
import { clipboard, stylesheet } from "@vendetta/metro/common";
import { semanticColors } from "@vendetta/ui";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { General } from "@vendetta/ui/components";
import { showToast } from "@vendetta/ui/toasts";

import Text from "$/components/Text";
import { openSheet } from "$/types";

const { View, Pressable } = General;

const CustomColorPickerActionSheet = findByName("CustomColorPickerActionSheet");

export default ({
  title,
  color,
  update,
}: {
  title: string;
  color: string;
  update: (color: string) => void;
}) => {
  const styles = stylesheet.createThemedStyleSheet({
    androidRipple: {
      color: semanticColors.ANDROID_RIPPLE,
      cornerRadius: 2147483647,
    } as any,
  });

  return (
    <View
      style={{
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        flex: 1 / 5,
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
        }}
        onPress={() =>
          // openSheet(ColorSheet, {
          //   title,
          //   color: color.slice(1),
          // })
          openSheet(CustomColorPickerActionSheet, {
            color: parseInt(color.slice(1), 16),
            onSelect: (clr: number) =>
              update(`#${clr.toString(16).padStart(6, "0")}`),
          })
        }
        onLongPress={() => {
          clipboard.setString(color);
          showToast("Copied", getAssetIDByName("toast_copy_message"));
        }}
      />
      <Text variant="text-sm/semibold" color="TEXT_NORMAL" align="center">
        {title}
      </Text>
    </View>
  );
};
