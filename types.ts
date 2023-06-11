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
