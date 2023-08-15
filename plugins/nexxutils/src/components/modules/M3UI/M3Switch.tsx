import { findByStoreName } from "@vendetta/metro";
import { React } from "@vendetta/metro/common";
import { ReactNative as RN, stylesheet } from "@vendetta/metro/common";
import { rawColors } from "@vendetta/ui";
import { lerp, resolveCustomSemantic } from "../../../stuff/colors";

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
  slot: any;
}) {
  const containerSize = { width: 52, height: 32 };
  const styles = {
    all: stylesheet.createThemedStyleSheet({
      container: {
        ...containerSize,
        borderRadius: 64,
      },

      ballContainer: {
        width: "100%",
        height: "100%",
      },

      ball: {
        height: "100%",
        aspectRatio: 1,
        borderRadius: 2147483647,
      },

      ripple: {
        color: resolveCustomSemantic(
          rawColors.PRIMARY_200,
          lerp(rawColors.BRAND_500, "#FFFFFF", 0.65)
        ),
      },
    }),
    activity: stylesheet.createThemedStyleSheet({
      containerInactive: {
        backgroundColor: resolveCustomSemantic(
          rawColors.WHITE_630,
          rawColors.BLACK_330
        ),
      },
      containerActive: {
        backgroundColor: resolveCustomSemantic(
          lerp(rawColors.BRAND_500, "#FFFFFF", 0.35),
          lerp(rawColors.BRAND_500, "#000000", 0.1)
        ),
      },

      insideContainerInactive: {
        backgroundColor: resolveCustomSemantic(
          rawColors.PRIMARY_600,
          rawColors.PRIMARY_200
        ),
        width: "100%",
        height: "100%",
        borderRadius: 60,
      },

      ballContainerInactive: {
        paddingHorizontal: 8,
        paddingVertical: 8,
      },
      ballContainerActive: {
        paddingHorizontal: 4,
        paddingVertical: 4,
      },
      ballContainerPress: {
        paddingHorizontal: 2,
        paddingVertical: 2,
      },

      ballInactive: {
        backgroundColor: resolveCustomSemantic(
          rawColors.WHITE_630,
          rawColors.BRAND_330
        ),
      },
      ballActive: {
        alignSelf: "flex-end",
        backgroundColor: resolveCustomSemantic(
          lerp(rawColors.BRAND_500, "#000000", 0.3),
          rawColors.WHITE_500
        ),
      },
    }),
    disabled: stylesheet.createThemedStyleSheet({
      containerDisabled: {
        backgroundColor: `${resolveCustomSemantic(
          rawColors.PRIMARY_200,
          rawColors.PRIMARY_730
        )}1f`,
      },

      insideContainerInactiveDisabled: {
        backgroundColor: `${resolveCustomSemantic(
          rawColors.WHITE_800,
          rawColors.PRIMARY_200
        )}1f`,
      },

      ballActiveDisabled: {
        backgroundColor: resolveCustomSemantic(
          rawColors.PRIMARY_800,
          rawColors.PRIMARY_100
        ),
      },
      ballInactiveDisabled: {
        backgroundColor: resolveCustomSemantic(
          rawColors.PRIMARY_200,
          rawColors.PRIMARY_730
        ),
      },
    }),
  };

  const [isPressing, setPressing] = React.useState(false);

  return (
    <RN.Pressable
      style={[
        styles.all.container,
        styles.activity[`container${value ? "Active" : "Inactive"}`],
        disabled && styles.disabled.containerDisabled,
        RN.StyleSheet.flatten(style) ?? {},
      ]}
      onPress={() => onValueChange?.(!value)}
      onPressIn={() => !disabled && setPressing(true)}
      onPressOut={() => !disabled && setPressing(false)}
    >
      {!value && (
        <RN.View
          style={{
            paddingHorizontal: 2,
            paddingVertical: 2,
            position: "absolute",
            left: 0,
            top: 0,
            width: "100%",
            height: "100%",
          }}
        >
          <RN.View
            style={[
              styles.activity.insideContainerInactive,
              disabled && styles.disabled.insideContainerInactiveDisabled,
            ]}
          />
        </RN.View>
      )}
      <RN.View
        style={[
          styles.all.ballContainer,
          styles.activity[`ballContainer${value ? "Active" : "Inactive"}`],
          isPressing && styles.activity.ballContainerPress,
        ]}
      >
        <RN.Pressable
          style={[
            styles.all.ball,
            styles.activity[`ball${value ? "Active" : "Inactive"}`],
            disabled &&
              styles.disabled[`ball${value ? "Active" : "Inactive"}Disabled`],
          ]}
          onPress={() => onValueChange?.(!value)}
          onPressIn={() => !disabled && setPressing(true)}
          onPressOut={() => !disabled && setPressing(false)}
        />
      </RN.View>
    </RN.Pressable>
  );
}
