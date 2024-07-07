import { React, stylesheet } from "@vendetta/metro/common";
import { semanticColors } from "@vendetta/ui";

import { Reanimated } from "$/deps";

export default function Skeleton({
  height,
  style,
}: {
  height: import("react-native").DimensionValue;
  style?: import("react-native").ViewStyle;
}) {
  const baseStyle = stylesheet.createThemedStyleSheet({
    skeleton: {
      height,
      borderRadius: 16,
      backgroundColor: semanticColors.BG_MOD_STRONG,
    },
  });

  const opacity = Reanimated.useSharedValue(1);
  React.useEffect(() => {
    opacity.value = Reanimated.withRepeat(
      Reanimated.withTiming(0.5, { duration: 1000 }),
      -1,
      true,
    );
  }, []);

  return (
    <Reanimated.default.View style={[baseStyle.skeleton, style, { opacity }]} />
  );
}
