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
