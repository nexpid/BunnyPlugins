import { makeStorage } from "$/storage";

import settings from "./components/Settings";
import patcher from "./stuff/patcher";
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

export const vstorage = makeStorage({
  iconpack: {
    url: null,
    suffix: "",
    force: null,
  },
});

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
