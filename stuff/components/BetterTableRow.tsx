import { ReactNative as RN, stylesheet } from "@vendetta/metro/common";
import { semanticColors } from "@vendetta/ui";
import { General } from "@vendetta/ui/components";

import Text from "./Text";

const { View, Pressable } = General;

export function BetterTableRowTitle({
  title,
  onPress,
  icon,
}: {
  title: string;
  onPress?: () => void;
  icon?: number;
}) {
  const styles = stylesheet.createThemedStyleSheet({
    androidRipple: {
      color: semanticColors.ANDROID_RIPPLE,
      //@ts-expect-error cornerRadius does not exist :nerd_face:
      cornerRadius: 4,
    },
    icon: {
      width: 16,
      height: 16,
      marginTop: 1.5,
      tintColor: semanticColors.TEXT_MUTED,
    },
  });
  const UseCompontent = onPress ? Pressable : View;

  return (
    <UseCompontent
      android_ripple={styles.androidRipple}
      disabled={false}
      accessibilityRole={"button"}
      onPress={onPress}
      style={{
        marginBottom: 8,
        gap: 4,
        flexDirection: "row",
        alignItems: "center",
      }}
    >
      {icon && (
        <RN.Image style={styles.icon} source={icon} resizeMode="cover" />
      )}
      <Text variant="text-sm/semibold" color="TEXT_MUTED">
        {title}
      </Text>
    </UseCompontent>
  );
}

export function BetterTableRowGroup({
  title,
  onTitlePress,
  icon,
  children,
  padding,
}: React.PropsWithChildren<{
  title?: string | React.ReactNode;
  onTitlePress?: () => void;
  icon?: number;
  padding?: boolean;
}>) {
  const styles = stylesheet.createThemedStyleSheet({
    main: {
      backgroundColor: semanticColors.CARD_PRIMARY_BG,
      borderRadius: 16,
      overflow: "hidden",
      flex: 1,
    },
  });

  return (
    <View style={{ marginHorizontal: 16, marginTop: 16 }}>
      {title ? (
        typeof title === "string" ? (
          <BetterTableRowTitle
            title={title}
            onPress={onTitlePress}
            icon={icon}
          />
        ) : (
          title
        )
      ) : null}
      <View style={styles.main}>
        {padding ? (
          <View style={{ paddingHorizontal: 16, paddingVertical: 16 }}>
            {children}
          </View>
        ) : (
          children
        )}
      </View>
    </View>
  );
}
