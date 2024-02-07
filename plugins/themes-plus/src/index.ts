import { storage } from "@vendetta/plugin";

import { Lang } from "$/lang";

import settings from "./components/Settings";
import patcher from "./stuff/patcher";
import { IconPack, IconPackData } from "./types";

export enum PatchType {
  Icons = "icons",
  UnreadBadgeColor = "unread_badge_color",
  CustomIconOverlays = "custom_icon_overlays",
  MentionLineColor = "mention_line_color",
  IconPack = "iconpack",
}

export enum InactiveReason {
  NoTheme = "no_theme",
  ThemesPlusUnsupported = "themes_plus_unsupported",
  NoIconpacksList = "no_iconpacks_list",
  NoIconpackConfig = "no_iconpack_config",
  NoIconpackFiles = "no_iconpack_files",
}

export const active: {
  active: boolean;
  iconpack: IconPack | null;
  iconpackList: IconPackData["list"];
  patches: PatchType[];
  blehhh: InactiveReason[];
} = {
  active: false,
  iconpack: null,
  iconpackList: [],
  patches: [],
  blehhh: [],
};

export const vstorage = storage as {
  iconpack: {
    url?: string;
    suffix: string;
    force?: string;
  };
};

export let cacheID = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
export function resetCacheID() {
  cacheID = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
}

export let enabled = false;

let unpatch: (exit: boolean) => void;
export async function runPatch() {
  enabled = true;
  unpatch = await patcher();
}
export function runUnpatch(exit: boolean) {
  enabled = false;
  unpatch?.(exit);
}

export const lang = new Lang("themes_plus");

export default {
  onLoad: () => {
    vstorage.iconpack ??= {
      url: null,
      suffix: "",
      force: null,
    };
    runPatch();
  },
  onUnload: () => runUnpatch(true),
  settings,
};
