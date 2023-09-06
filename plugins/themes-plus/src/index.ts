import patcher from "./stuff/patcher";
import settings from "./components/Settings";
import { storage } from "@vendetta/plugin";
import { IconPack, IconPackData } from "./types";

export enum PatchType {
  Icons,
  UnreadBadgeColor,
  CustomIconOverlays,
  MentionLineColor,
  IconPack,
}

export enum InactiveReason {
  NoTheme = "No theme selected",
  ThemesPlusUnsupported = "Selected theme doesn't support Themes+",
  IconpacksListNuhUh = "Couldn't fetch list of iconpacks",
  IconpackConfigNuhUh = "Couldn't fetch iconpack config",
  IconpackTreeNuhUh = "Couldn't fetch iconpack tree",
}

export let active: {
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

export const vstorage: {
  iconpack?: {
    url: string | null;
    suffix: string;
    force: string | null;
  };
} = storage;

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

export default {
  onLoad: () => runPatch(),
  onUnload: () => runUnpatch(true),
  settings,
};
