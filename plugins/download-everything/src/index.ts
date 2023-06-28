import { before } from "@vendetta/patcher";
import settings from "./components/Settings";
import { findByProps, findByStoreName } from "@vendetta/metro";
import { interceptGuildActions, interceptUserActions } from "./stuff/actions";
import { storage } from "@vendetta/plugin";

export const LazyActionSheet = findByProps("openLazy", "hideActionSheet");
export const UserProfile = findByProps(
  "PRIMARY_INFO_TOP_OFFSET",
  "SECONDARY_INFO_TOP_MARGIN",
  "SIDE_PADDING"
);

export const ThemeStore = findByStoreName("ThemeStore");
export const Colors = findByProps("colors", "meta") as {
  colors: any;
  meta: {
    resolveSemanticColor: (theme: string, color: string) => string | undefined;
  };
};

export const vstorage = storage as Record<
  | "voice_messages"
  | "stickers"
  | "emojis"
  | "guild_icon"
  | "guild_banner"
  | "guild_invite_background"
  | "user_avatar"
  | "user_banner",
  boolean | undefined
>;

let patches = [];
export default {
  onLoad: () => {
    patches.push(
      before("openLazy", LazyActionSheet, (ctx) => {
        const [component, args, action] = ctx;

        if (
          !component ||
          typeof args !== "string" ||
          typeof action !== "object"
        )
          return;

        if (args.startsWith("UserProfile"))
          component.then(interceptUserActions);
        else if (args.startsWith("GuildProfile:"))
          component.then(interceptGuildActions);
      })
    );
  },
  onUnload: () => {
    for (const x of patches) x();
    patches = [];
  },
  settings,
};
