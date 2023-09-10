import { React, ReactNative as RN, stylesheet } from "@vendetta/metro/common";
import { SimpleText } from "../../../../../../../stuff/types";
import { lerp, resolveCustomSemantic } from "../../../../stuff/colors";
import { rawColors } from "@vendetta/ui";

const AnimatedPressable = RN.Animated.createAnimatedComponent(RN.Pressable);

export default ({
  label,
  color,
  onPress,
}: {
  label: string;
  color: string;
  onPress?: () => void;
}) => {
  const bleh = resolveCustomSemantic(
    lerp(rawColors.BRAND_500, "#FFFFFF", 0.25),
    lerp(rawColors.BRAND_500, "#000000", 0.15)
  );
  const styles = stylesheet.createThemedStyleSheet({
    container: {
      alignItems: "baseline",
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderRadius: 2147483647,
    },
    inactive: {
      backgroundColor: `${bleh}00`,
    },
    active: {
      backgroundColor: `${bleh}14`,
    },
  });

  const [isPressing, setIsPressing] = React.useState(false);
  const pressVal = React.useRef(
    new RN.Animated.Value(isPressing ? 1 : 0)
  ).current;

  React.useEffect(() => {
    RN.Animated.timing(pressVal, {
      toValue: isPressing ? 1 : 0,
      duration: 100,
      easing: RN.Easing.linear,
      useNativeDriver: true,
    }).start();
  }, [isPressing]);

  return (
    <AnimatedPressable
      style={[
        styles.container,
        {
          backgroundColor: pressVal.interpolate({
            inputRange: [0, 1],
            outputRange: [
              styles.inactive.backgroundColor,
              styles.active.backgroundColor,
            ],
          }),
        },
      ]}
      onPressIn={() => setIsPressing(true)}
      onPressOut={() => setIsPressing(false)}
      onPress={() => onPress?.()}
      accessibilityRole="button"
      accessibilityState={{
        disabled: false,
      }}
      accessible={true}
      collapsable={false}
      disabled={false}
      pointerEvents={"box-only"}
    >
      <SimpleText variant="text-md/semibold" color={`TEXT_${color}`}>
        {label}
      </SimpleText>
    </AnimatedPressable>
  );
};
