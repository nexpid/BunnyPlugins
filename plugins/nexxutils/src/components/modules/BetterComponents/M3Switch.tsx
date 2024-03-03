import { React } from "@vendetta/metro/common";
import { ReactNative as RN, stylesheet } from "@vendetta/metro/common";
import { rawColors } from "@vendetta/ui";

import { lerp, resolveCustomSemantic } from "$/types";

const AnimatedPressable = RN.Animated.createAnimatedComponent(RN.Pressable);

export default function ({
  disabled,
  onValueChange,
  style,
  value,
}: {
  disabled?: boolean;
  onValueChange?: (val: boolean) => void;
  style?: any;
  value?: boolean;
}) {
  const containerSize = { width: 52, height: 32 };
  const styles = {
    all: stylesheet.createThemedStyleSheet({
      container: {
        ...containerSize,
        flexGrow: 0,
        flexShrink: 0,
        borderRadius: 64,
        borderWidth: 2,
        padding: 2,
      },

      ballBox: {
        height: "100%",
        aspectRatio: 1,
      },

      ball: {
        borderRadius: 2147483647,
        width: "100%",
        height: "100%",
      },
    }),
    activity: stylesheet.createThemedStyleSheet({
      containerInactive: {
        backgroundColor: resolveCustomSemantic(
          rawColors.PRIMARY_600,
          rawColors.PRIMARY_200,
        ),
        borderColor: resolveCustomSemantic(
          rawColors.WHITE_630,
          rawColors.BLACK_330,
        ),
      },
      containerActive: {
        backgroundColor: resolveCustomSemantic(
          lerp(rawColors.BRAND_500, "#FFFFFF", 0.15),
          lerp(rawColors.BRAND_500, "#000000", 0.2),
        ),
      },

      ballInactive: {
        backgroundColor: resolveCustomSemantic(
          rawColors.WHITE_630,
          rawColors.BRAND_330,
        ),
      },
      ballActive: {
        backgroundColor: resolveCustomSemantic(
          lerp(rawColors.BRAND_500, "#000000", 0.65),
          rawColors.WHITE_500,
        ),
      },
    }),
    disabled: stylesheet.createThemedStyleSheet({
      containerInactiveDisabled: {
        backgroundColor: `${resolveCustomSemantic(
          rawColors.WHITE_800,
          rawColors.PRIMARY_200,
        )}1f`,
        borderColor: `${resolveCustomSemantic(
          rawColors.WHITE_800,
          rawColors.PRIMARY_200,
        )}1f`,
      },
      containerActiveDisabled: {
        backgroundColor: `${resolveCustomSemantic(
          rawColors.PRIMARY_200,
          rawColors.PRIMARY_730,
        )}1f`,
      },

      ballActiveDisabled: {
        backgroundColor: resolveCustomSemantic(
          rawColors.PRIMARY_800,
          rawColors.PRIMARY_100,
        ),
      },
      ballInactiveDisabled: {
        backgroundColor: resolveCustomSemantic(
          rawColors.PRIMARY_200,
          rawColors.PRIMARY_730,
        ),
      },
    }),
  };

  const [isPressing, setPressing] = React.useState(false);

  const ballPosVal = React.useRef(new RN.Animated.Value(value ? 1 : 0)).current;

  const pressScales = {
    inactive: 16 / 24,
    pressed: 28 / 24,
  };
  const pressVal = React.useRef(
    new RN.Animated.Value(value ? 1 : pressScales.inactive),
  ).current;

  const toggle = () => {
    onValueChange?.(!value);
  };
  const updatePressVal = () => {
    RN.Animated.timing(pressVal, {
      toValue: value ? 1 : pressScales.inactive,
      duration: 150,
      easing: RN.Easing.bezier(0.05, 0.7, 0.1, 1.0),
      useNativeDriver: true,
    }).start();
  };

  React.useEffect(() => {
    RN.Animated.timing(ballPosVal, {
      toValue: value ? 1 : 0,
      duration: 200,
      easing: RN.Easing.bezier(0, 0, 0, 1),
      useNativeDriver: true,
    }).start();
    updatePressVal();
  }, [value]);
  React.useEffect(() => updatePressVal(), [isPressing]);

  return (
    <AnimatedPressable
      style={[
        styles.all.container,
        {
          backgroundColor: ballPosVal.interpolate({
            inputRange: [0, 1],
            outputRange: disabled
              ? [
                  styles.disabled.containerInactiveDisabled.backgroundColor,
                  styles.disabled.containerActiveDisabled.backgroundColor,
                ]
              : [
                  styles.activity.containerInactive.backgroundColor,
                  styles.activity.containerActive.backgroundColor,
                ],
          }),
          borderColor: ballPosVal.interpolate({
            inputRange: [0, 1],
            outputRange: disabled
              ? [
                  styles.disabled.containerInactiveDisabled.borderColor,
                  styles.disabled.containerActiveDisabled.backgroundColor,
                ]
              : [
                  styles.activity.containerInactive.borderColor,
                  styles.activity.containerActive.backgroundColor,
                ],
          }),
        },
        RN.StyleSheet.flatten(style) ?? {},
      ]}
      onPress={toggle}
      onAccessibilityTap={toggle}
      onPressIn={() => !disabled && setPressing(true)}
      onPressOut={() => !disabled && setPressing(false)}
      accessibilityRole="switch"
      accessibilityState={{
        checked: value,
        disabled,
      }}
      accessible={!disabled}
      collapsable={false}
      disabled={false}
    >
      <RN.Animated.View
        style={[
          styles.all.ballBox,
          {
            transform: [
              {
                translateX: ballPosVal.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, containerSize.width - containerSize.height],
                }),
              },
            ],
          },
        ]}
      >
        <RN.Animated.View
          style={[
            styles.all.ball,
            {
              backgroundColor: ballPosVal.interpolate({
                inputRange: [0, 1],
                outputRange: disabled
                  ? [
                      styles.disabled.ballInactiveDisabled.backgroundColor,
                      styles.disabled.ballActiveDisabled.backgroundColor,
                    ]
                  : [
                      styles.activity.ballInactive.backgroundColor,
                      styles.activity.ballActive.backgroundColor,
                    ],
              }),
              transform: [
                {
                  scale: isPressing ? pressScales.pressed : pressVal,
                },
              ],
            },
          ]}
        />
      </RN.Animated.View>
    </AnimatedPressable>
  );
}
