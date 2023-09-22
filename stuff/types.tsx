import { logger } from "@vendetta";
import {
  find,
  findByName,
  findByProps,
  findByStoreName,
} from "@vendetta/metro";
import { ReactNative as RN, React, stylesheet } from "@vendetta/metro/common";
import { semanticColors } from "@vendetta/ui";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { Forms, General } from "@vendetta/ui/components";
import { showToast } from "@vendetta/ui/toasts";
import { without } from "@vendetta/utils";

const ThemeStore = findByStoreName("ThemeStore");
const colors = findByProps("colors", "meta");
const { triggerHaptic } = findByProps("triggerHaptic");

const { TextStyleSheet } = findByProps("TextStyleSheet");
const { View, Text, Pressable } = General;
const { FormRow } = Forms;

export const ActionSheet =
  findByProps("ActionSheet")?.ActionSheet ??
  find((x) => x.render?.name === "ActionSheet"); // thank you to @pylixonly for fixing this
export const { openLazy, hideActionSheet } = findByProps(
  "openLazy",
  "hideActionSheet"
);
export const {
  ActionSheetTitleHeader,
  ActionSheetCloseButton,
  ActionSheetContentContainer,
} = findByProps(
  "ActionSheetTitleHeader",
  "ActionSheetCloseButton",
  "ActionSheetContentContainer"
);
export const ActionSheetRow = findByProps("ActionSheetRow")?.ActionSheetRow;

export const Navigator =
  findByName("Navigator") ?? findByProps("Navigator")?.Navigator;
export const modalCloseButton =
  findByProps("getRenderCloseButton")?.getRenderCloseButton ??
  findByProps("getHeaderCloseButton")?.getHeaderCloseButton;
export const { popModal, pushModal } = findByProps("popModal", "pushModal");

export type Entries<T> = [keyof T, T[keyof T]];

// ...

export function resolveSemanticColor(color: string) {
  return colors.meta.resolveSemanticColor(ThemeStore.theme, color);
}

export function getUserAvatar(
  user: {
    discriminator: string;
    avatar?: string;
    id: string;
  },
  animated?: boolean
): string {
  const isPomelo = user.discriminator === "0";

  return user.avatar
    ? `https://cdn.discordapp.com/avatars/${user.id}/${
        animated && user.avatar.startsWith("a_")
          ? `${user.avatar}.gif`
          : `${user.avatar}.png`
      }`
    : `https://cdn.discordapp.com/embed/avatars/${
        isPomelo
          ? (parseInt(user.id) >> 22) % 6
          : parseInt(user.discriminator) % 5
      }`;
}

export function openSheet<T extends React.FunctionComponent>(
  sheet: T,
  props: Parameters<T>[0]
) {
  try {
    openLazy(
      new Promise((x) =>
        x({
          default: sheet,
        })
      ),
      "ActionSheet",
      props
    );
  } catch (e) {
    logger.error(e.stack);
    showToast(
      "Got error when opening ActionSheet! Please check debug logs",
      getAssetIDByName("Smal")
    );
  }
}

export function openModal(key: string, modal: typeof Modal) {
  const empty = Symbol("empty");
  if (!Navigator || !modalCloseButton)
    return showToast(
      `${[
        Navigator ? empty : "Navigator",
        modalCloseButton ? empty : "modalCloseButton",
      ]
        .filter((x) => x !== empty)
        .join(", ")} is missing! Please try reinstalling Vendetta`,
      getAssetIDByName("Small")
    );

  pushModal({
    key,
    modal: {
      key,
      modal,
      animation: "slide-up",
      shouldPersistUnderModals: false,
      closable: true,
    },
  });
}

export function doHaptic(dur: number): Promise<void> {
  triggerHaptic();
  const interval = setInterval(triggerHaptic, 1);
  return new Promise((res) =>
    setTimeout(() => res(clearInterval(interval)), dur)
  );
}

// ...

export function CoolActionSheetRow({
  label,
  icon,
  onPress,
}: {
  label: string;
  icon: number;
  onPress?: () => void;
}) {
  const styles = stylesheet.createThemedStyleSheet({
    iconComponent: {
      width: 24,
      height: 24,
      tintColor: semanticColors.INTERACTIVE_NORMAL,
    },
  });

  return ActionSheetRow ? (
    <ActionSheetRow
      label={label}
      icon={
        <ActionSheetRow.Icon
          source={icon}
          IconComponent={() => (
            <RN.Image
              resizeMode="cover"
              style={styles.iconComponent}
              source={icon}
            />
          )}
        />
      }
      onPress={() => onPress?.()}
    />
  ) : (
    <FormRow
      label={label}
      leading={<FormRow.Icon source={icon} />}
      onPress={() => onPress?.()}
    />
  );
}

export function Modal(
  props: React.PropsWithChildren<{
    mkey: string;
    headerRight?: React.FunctionComponent;
    title?: string;
  }>
) {
  if (!Navigator || !modalCloseButton) return null;
  return (
    <Navigator
      initialRouteName={props.mkey}
      screens={{
        [props.mkey]: Object.assign(without(props, "mkey", "children"), {
          headerLeft: modalCloseButton?.(() => popModal(props.mkey)),
          render: () => props.children,
        }),
      }}
    />
  );
}

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
    },
    icon: {
      height: 18,
      tintColor: semanticColors.HEADER_SECONDARY,
      opacity: 0.5,
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
        flexDirection: "row",
        justifyContent: "flex-start",
        alignItems: "center",
      }}
    >
      {icon && (
        <View style={{ marginRight: 4 }}>
          <RN.Image style={styles.icon} source={icon} resizeMode="contain" />
        </View>
      )}
      <SimpleText variant="text-sm/semibold" color="HEADER_SECONDARY">
        {title}
      </SimpleText>
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
  title: string;
  onTitlePress?: () => void;
  icon?: number;
  padding?: boolean;
}>) {
  const styles = stylesheet.createThemedStyleSheet({
    main: {
      backgroundColor: semanticColors.REDESIGN_ACTIVITY_CARD_BACKGROUND,
      borderRadius: 16,
      overflow: "hidden",
      flex: 1,
    },
  });

  return (
    <View style={{ marginHorizontal: 16, marginTop: 16 }}>
      <BetterTableRowTitle title={title} onPress={onTitlePress} icon={icon} />
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

export function LineDivider({ addPadding }: { addPadding?: boolean }) {
  const styles = stylesheet.createThemedStyleSheet({
    line: {
      width: "100%",
      height: 2,
      backgroundColor: semanticColors.BACKGROUND_ACCENT,
      borderRadius: 2147483647,
    },
  });

  return (
    <View
      style={[
        { marginTop: 16, marginBottom: 16 },
        addPadding && { marginHorizontal: 16 },
      ]}
    >
      <View style={styles.line} />
    </View>
  );
}

export namespace RichText {
  export function Bold({
    children,
    onPress,
  }: React.PropsWithChildren<{
    onPress?: () => void;
  }>) {
    return (
      <SimpleText variant={"text-md/bold"} onPress={onPress}>
        {children}
      </SimpleText>
    );
  }

  export function Underline({
    children,
    onPress,
  }: React.PropsWithChildren<{
    onPress?: () => void;
  }>) {
    return (
      <Text style={{ textDecorationLine: "underline" }} onPress={onPress}>
        {children}
      </Text>
    );
  }
}

export function SimpleText({
  variant,
  lineClamp,
  color,
  align,
  style,
  onPress,
  getChildren,
  children,
  liveUpdate,
}: React.PropsWithChildren<{
  variant?: string;
  lineClamp?: number;
  color?: string;
  align?: "left" | "right" | "center";
  style?: any;
  onPress?: () => void;
  getChildren?: () => React.ReactNode | undefined;
  liveUpdate?: boolean;
}>) {
  const [_, forceUpdate] = React.useReducer((x) => ~x, 0);

  React.useEffect(() => {
    if (!liveUpdate) return;
    const nextSecond = new Date().setMilliseconds(1000);

    let interval: any, timeout: any;
    timeout = setTimeout(() => {
      forceUpdate();
      interval = setInterval(forceUpdate, 1000);
    }, nextSecond - Date.now());

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, []);

  return (
    <Text
      style={[
        variant ? TextStyleSheet[variant] : {},
        color ? { color: resolveSemanticColor(semanticColors[color]) } : {},
        align ? { textAlign: align } : {},
        style ?? {},
      ]}
      numberOfLines={lineClamp}
      onPress={onPress}
    >
      {getChildren?.() ?? children}
    </Text>
  );
}

export function SuperAwesomeIcon({
  onPress,
  onLongPress,
  icon,
  style,
  destructive,
  color,
}: {
  onPress?: () => void;
  onLongPress?: () => void;
  destructive?: boolean;
  color?: any;
  icon: number;
  style: "header" | "card" | any;
}) {
  const styles = stylesheet.createThemedStyleSheet({
    headerStyleIcon: {
      width: 24,
      height: 24,
      marginRight: 10,
      tintColor: semanticColors.HEADER_PRIMARY,
    },
    cardStyleIcon: {
      width: 22,
      height: 22,
      marginLeft: 5,
      tintColor: semanticColors.INTERACTIVE_NORMAL,
    },
    destructiveIcon: {
      tintColor: semanticColors.TEXT_DANGER,
    },
  });

  return (
    <RN.TouchableOpacity onPress={onPress} onLongPress={onLongPress}>
      <RN.Image
        style={[
          typeof style === "string"
            ? style === "header"
              ? styles.headerStyleIcon
              : styles.cardStyleIcon
            : style,
          destructive && styles.destructiveIcon,
          color && { tintColor: color },
        ].filter((x) => !!x)}
        source={icon}
      />
    </RN.TouchableOpacity>
  );
}

export function isObject(x: Record<any, any>) {
  return typeof x === "object" && !Array.isArray(x);
}
