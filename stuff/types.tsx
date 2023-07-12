import { findByProps, findByStoreName } from "@vendetta/metro";
import {
  ReactNative as RN,
  React,
  constants,
  stylesheet,
} from "@vendetta/metro/common";
import { semanticColors } from "@vendetta/ui";
import { Forms, General } from "@vendetta/ui/components";

const { TextStyleSheet } = findByProps("TextStyleSheet");
const { View, Text, Pressable } = General;
const { FormRow } = Forms;

export interface DisplayProfileData {
  displayProfile: {
    userId: string;
    guildId?: string;
    banner?: string;
    bio?: string;
    pronouns: string;
    accentColor?: number;
    emoji?: any;
    themeColors?: number[];
    popoutAnimationParticleType?: any;
    _profileThemesExperimentBucket?: number;
    _guildMemberProfile?: GuildMemberProfile;
  };
  user: User;
}

export interface User {
  hasFlag: (flag: any) => boolean;
  isStaff: () => boolean;
  isStaffPersonal: () => boolean;
  hasAnyStaffLevel: () => boolean;
  id: string;
  username: string;
  discriminator: string;
  avatar?: string;
  avatarDecoration?: string;
  email?: string;
  verified: boolean;
  bot: boolean;
  system: boolean;
  mfaEnabled: boolean;
  mobile: boolean;
  desktop: boolean;
  premiumType?: number;
  flags: number;
  publicFlags: number;
  purchasedFlags: number;
  premiumUsageFlags: number;
  phone?: string;
  nsfwAllowed?: boolean;
  guildMemberAvatars: Record<string, string>;
  hasBouncedEmail: boolean; // ???,
  personalConnectionId?: any; // ???,
  globalName: string;
}

export interface GuildMemberProfile {
  userId: string;
  guildId: string;
  avatar?: string;
  banner?: string;
  accentColor?: number;
  emoji?: any;
  themeColors?: number[];
  popoutAnimationParticleType?: any;
  bio?: string;
  pronouns?: string;
  badges: any[];
}

export interface ReactionEvent {
  channelId: string;
  messageId: string;
  userId: string;
  emoji: { name: string; id?: string; animated?: boolean };
  burst: boolean;
  colors: string[];
  messageAuthorId: string;
}

type VendettaSysColor = [
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string
];
export type VendettaSysColors = Record<
  "neutral1" | "neutral2" | "accent1" | "accent2" | "accent3",
  VendettaSysColor
>;

// ...

export function resolveSemanticColor(color: string) {
  const colors = findByProps("colors", "meta");
  const ThemeStore = findByStoreName("ThemeStore");

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
}>): React.JSX.Element {
  const styles = stylesheet.createThemedStyleSheet({
    androidRipple: {
      color: semanticColors.ANDROID_RIPPLE,
    },
    mainText: {
      fontFamily: constants.Fonts.PRIMARY_SEMIBOLD,
      fontSize: 14,
      includeFontPadding: false,
      letterSpacing: undefined,
      lineHeight: 18,
      textTransform: "none",
      color: semanticColors.HEADER_SECONDARY,
    },
    icon: {
      height: 14,
      tintColor: semanticColors.HEADER_SECONDARY,
    },
    main: {
      backgroundColor: semanticColors.BACKGROUND_TERTIARY,
      borderRadius: 16,
      overflow: "hidden",
      flex: 1,
    },
  });

  const UseCompontent = onTitlePress ? Pressable : View;

  return (
    <View style={{ marginHorizontal: 16, marginTop: 16 }}>
      <UseCompontent
        android_ripple={styles.androidRipple}
        disabled={false}
        accessibilityRole={"button"}
        onPress={onTitlePress}
        style={{
          marginBottom: 8,
          flexDirection: "row",
          justifyContent: "flex-start",
          alignItems: "center",
        }}
      >
        {icon && (
          <View style={{ marginRight: 4 }}>
            <FormRow.Icon style={styles.icon} source={icon} size="small" />
          </View>
        )}
        <Text style={styles.mainText}>{title}</Text>
      </UseCompontent>
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

export function LineDivider({
  addPadding,
}: {
  addPadding?: boolean;
}): React.JSX.Element {
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
  }>): React.JSX.Element {
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
  }>): React.JSX.Element {
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

  const nextSecond = new Date().setMilliseconds(1000);
  if (liveUpdate) setTimeout(() => forceUpdate(), nextSecond - Date.now());

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
  icon,
  style,
  destructive,
}: {
  onPress?: () => void;
  destructive?: boolean;
  icon: number;
  style: "header" | "card" | any;
}): React.JSX.Element {
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
    <RN.TouchableOpacity onPress={onPress}>
      <RN.Image
        style={[
          typeof style === "string"
            ? style === "header"
              ? styles.headerStyleIcon
              : styles.cardStyleIcon
            : style,
          destructive && styles.destructiveIcon,
        ].filter((x) => !!x)}
        source={icon}
      />
    </RN.TouchableOpacity>
  );
}

export function isObject(x: Record<any, any>) {
  return typeof x === "object" && !Array.isArray(x);
}
