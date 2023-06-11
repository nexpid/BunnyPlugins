import { after, before } from "@vendetta/patcher";
import settings from "./settings";
import { findByProps, findByStoreName } from "@vendetta/metro";
import { interceptGuildActions, interceptUserActions } from "./actions";

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
  settings: settings,
};
