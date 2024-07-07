// https://raw.githubusercontent.com/pyoncord/Bunny/dev/src/core/ui/settings/pages/Plugins/PluginCard.tsx
// this is a modified version with some plugin browser specific changes

import { React, ReactNative as RN, stylesheet } from "@vendetta/metro/common";
import { rawColors, semanticColors } from "@vendetta/ui";
import { getAssetIDByName } from "@vendetta/ui/assets";

import { hideActionSheet } from "$/components/ActionSheet";
import { showSimpleActionSheet } from "$/components/ActionSheet";
import Text from "$/components/Text";
import { Reanimated } from "$/deps";
import { buttonVariantPolyfill, IconButton, Stack } from "$/lib/redesign";
import { lerp } from "$/types";

// TODO: These styles work weirdly. iOS has cramped text, Android with low DPI probably does too. Fix?

const styles = stylesheet.createThemedStyleSheet({
  card: {
    padding: 16,
    borderRadius: 16,
    borderColor: semanticColors.BORDER_FAINT,
    borderWidth: 1,
    backgroundColor: semanticColors.CARD_PRIMARY_BG,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  pluginIcon: {
    tintColor: semanticColors.TEXT_NORMAL,
    width: 18,
    height: 18,
  },
  actions: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 5,
  },
});

interface Action {
  icon: string;
  disabled?: boolean;
  isDestructive?: boolean;
  loading?: boolean;
  onPress: () => void;
}

type OverflowAction = Omit<Action, "loading"> & {
  label: string;
};

interface CardProps {
  headerLabel: React.ReactNode;
  headerSuffix?: React.ReactNode;
  headerSublabel?: React.ReactNode;
  headerIcon?: string;
  descriptionLabel?: string;
  actions?: Action[];
  overflowTitle?: string;
  overflowActions?: OverflowAction[];
  highlight?: boolean;
  disabled?: boolean;
}

export default function Card(props: CardProps) {
  const baseColor = styles.card.backgroundColor as any as string;
  const highlightColor = lerp(
    baseColor,
    rawColors.BRAND_500,
    0.08,
  ) as any as string;

  const color = Reanimated.useSharedValue(baseColor);

  React.useEffect(() => {
    color.value = baseColor;
    if (props.highlight)
      color.value = Reanimated.withSequence(
        Reanimated.withTiming(highlightColor, {
          duration: 500,
          easing: Reanimated.Easing.cubic,
        }),
        Reanimated.withTiming(baseColor, {
          duration: 500,
          easing: Reanimated.Easing.cubic,
        }),
      );
  }, [props.highlight]);

  return (
    <Reanimated.default.View
      style={[
        styles.card,
        {
          backgroundColor: color,
        },
        props.disabled && { opacity: 0.5 },
      ]}
    >
      <Stack spacing={16}>
        <RN.View style={styles.content}>
          <Stack spacing={0}>
            <RN.View style={styles.title}>
              {getAssetIDByName(props.headerIcon) && (
                <RN.Image
                  style={styles.pluginIcon}
                  resizeMode="cover"
                  source={getAssetIDByName(props.headerIcon)}
                />
              )}
              <Text
                variant="heading-md/semibold"
                color="TEXT_NORMAL"
                lineClamp={1}
              >
                {props.headerLabel}
              </Text>
              {props.headerSuffix}
            </RN.View>
            {props.headerSublabel && (
              <Text variant="text-md/semibold" color="TEXT_MUTED">
                {props.headerSublabel}
              </Text>
            )}
          </Stack>
          <RN.View style={{ marginLeft: "auto" }}>
            <Stack spacing={12} direction="horizontal">
              {props.actions?.map(
                ({ icon, onPress, isDestructive, loading, disabled }) => (
                  <IconButton
                    onPress={onPress}
                    disabled={disabled}
                    loading={loading}
                    size="sm"
                    variant={
                      isDestructive
                        ? buttonVariantPolyfill().destructive
                        : "secondary"
                    }
                    icon={getAssetIDByName(icon)}
                  />
                ),
              )}
              {props.overflowActions && (
                <IconButton
                  onPress={() =>
                    showSimpleActionSheet({
                      key: "CardOverflow",
                      header: {
                        title: props.overflowTitle,
                        icon: getAssetIDByName(props.headerIcon),
                        onClose: () => hideActionSheet(),
                      },
                      options: props.overflowActions?.map((i) => ({
                        ...i,
                        icon: getAssetIDByName(i.icon),
                      })),
                    })
                  }
                  size="sm"
                  variant="secondary"
                  icon={getAssetIDByName("CircleInformationIcon-primary")}
                />
              )}
            </Stack>
          </RN.View>
        </RN.View>
        {props.descriptionLabel && (
          <Text variant="text-md/normal" color="TEXT_NORMAL">
            {props.descriptionLabel}
          </Text>
        )}
      </Stack>
    </Reanimated.default.View>
  );
}
