import { findByProps, findByStoreName } from "@vendetta/metro";
import {
  ReactNative as RN,
  constants,
  stylesheet,
} from "@vendetta/metro/common";
import { semanticColors } from "@vendetta/ui";
import { Forms, General } from "@vendetta/ui/components";

const { TextStyleSheet } = findByProps("TextStyleSheet");
const { View, Text } = General;
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

// i have no clue what half of these are
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

// ...

export interface ReactionEvent {
  channelId: string;
  messageId: string;
  userId: string;
  emoji: { name: string; id?: string; animated?: boolean };
  burst: boolean;
  colors: string[];
  messageAuthorId: string;
}

// ...

export function resolveSemanticColor(color: string) {
  const colors = findByProps("colors", "meta");
  const ThemeStore = findByStoreName("ThemeStore");

  return colors.meta.resolveSemanticColor(ThemeStore.theme, color);
}

export function getUserAvatar(user: User, animated?: boolean): string {
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
  icon,
  children,
  padding,
}: {
  title: string;
  icon?: number;
  children?: React.ReactNode;
  padding?: boolean;
}): React.JSX.Element {
  const styles = stylesheet.createThemedStyleSheet({
    mainText: {
      fontFamily: constants.Fonts.PRIMARY_SEMIBOLD,
      fontSize: 14,
      includeFontPadding: false,
      letterSpacing: undefined,
      lineHeight: 18,
      textTransform: "none",
      color: resolveSemanticColor(semanticColors.HEADER_SECONDARY),
    },
    main: {
      backgroundColor: resolveSemanticColor(semanticColors.BACKGROUND_TERTIARY),
      borderRadius: 16,
      overflow: "hidden",
      flex: 1,
    },
  });

  return (
    <View style={{ marginHorizontal: 16, marginTop: 16 }}>
      <View
        style={{
          marginBottom: 8,
          flexDirection: "row",
          justifyContent: "flex-start",
          alignItems: "center",
        }}
      >
        {icon && (
          <View style={{ marginRight: 4 }}>
            <FormRow.Icon source={icon} size="small" />
          </View>
        )}
        <Text style={styles.mainText}>{title}</Text>
      </View>
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
      marginHorizontal: addPadding && 16,
      height: 2,
      backgroundColor: resolveSemanticColor(semanticColors.BACKGROUND_ACCENT),
      marginTop: 8,
      marginBottom: 8,
    },
  });

  return <View style={styles.line} />;
}

export namespace RichText {
  export function Bold({
    children,
  }: {
    children?: (string | React.JSX.Element) | (string | React.JSX.Element)[];
  }): React.JSX.Element {
    return <Text style={TextStyleSheet["text-md/bold"]}>{children}</Text>;
  }
}

export function SimpleText({
  variant,
  lineClamp,
  color,
  align,
  style,
  onPress,
  children,
}: {
  variant?: string;
  lineClamp?: number;
  color?: string;
  align?: "left" | "right" | "center";
  style?: Record<string, any>;
  onPress?: () => void;
  children?: React.ReactNode;
}) {
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
      {children}
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
  style: "header" | "card";
}): React.JSX.Element {
  const styles = stylesheet.createThemedStyleSheet({
    headerStyleIcon: {
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
          style === "header" ? styles.headerStyleIcon : styles.cardStyleIcon,
          destructive && styles.destructiveIcon,
        ].filter((x) => !!x)}
        source={icon}
      />
    </RN.TouchableOpacity>
  );
}
