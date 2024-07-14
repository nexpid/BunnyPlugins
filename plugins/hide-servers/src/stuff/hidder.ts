import { findByStoreName } from "@vendetta/metro";
import { FluxDispatcher } from "@vendetta/metro/common";

const GuildStore = findByStoreName("GuildStore");
const EmojiStore = findByStoreName("EmojiStore");
const StickersStore = findByStoreName("StickersStore");

export const removedCache = {};

const convertGuild = (id: string) => {
  const guild = GuildStore.getGuild(id);
  const roles = GuildStore.getRoles(id);
  const emojis = EmojiStore.getGuildEmoji(id);
  const stickers = StickersStore.getStickersByGuildId(id);

  const features = [];
  guild.features.forEach((x: any) => features.push(x));

  return {
    verification_level: guild.verificationLevel,
    preferred_locale: guild.preferredLocale,
    afk_channel_id: guild.afkChannelId,
    vanity_url_code: guild.vanityUrlCode,
    splash: guild.splash,
    icon: guild.icon,
    widget_enabled: guild.widgetEnabled,
    rules_channel_id: guild.rulesChannelId,
    premium_tier: guild.premiumTier,
    nsfw: guild.nsfw,
    system_channel_flags: guild.systemChannelFlags,
    system_channel_id: guild.systemChannelId,
    max_members: guild.maxMembers,
    afk_timeout: guild.afkTimeout,
    hub_type: guild.hubType,
    latest_onboarding_question_id: guild.latestOnboardingQuestionId,
    banner: guild.banner,
    nsfw_level: guild.nsfwLevel,
    max_stage_video_channel_users: guild.maxStageVideoChannelUsers,
    max_video_channel_users: guild.maxVideoChannelUsers,
    premium_progress_bar_enabled: guild.premiumProgressBarEnabled,
    safety_alerts_channel_id: guild.safetyAlertsChannelId,
    description: guild.description,
    owner_id: guild.ownerId,
    public_updates_channel_id: guild.publicUpdatesChannelId,
    widget_channel_id: guild.widgetChannelId,
    home_header: guild.homeHeader,
    discovery_splash: guild.discoverySplash,
    explicit_content_filter: guild.explicitContentFilter,
    default_message_notifications: guild.defaultMessageNotifications,
    mfa_level: guild.mfaLevel,
    name: guild.name,

    application_id: guild.application_id,
    premium_subscription_count: guild.premiumSubscriberCount,

    id,
    guild_id: id,
    version: Math.random().toString(),
    features,
    roles,
    emojis,
    stickers,
  };
};

export function hideGuild(id: string) {
  removedCache[id] = convertGuild(id);
  return FluxDispatcher.dispatch({
    type: "GUILD_DELETE",
    guild: { id },
  });
}

export function showGuild(id: string) {
  if (!removedCache[id]) return;
  return FluxDispatcher.dispatch({
    type: "GUILD_CREATE",
    guild: removedCache[id],
  });
}
