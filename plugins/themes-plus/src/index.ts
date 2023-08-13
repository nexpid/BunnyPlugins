import patcher from "./stuff/patcher";
import settings from "./components/Settings";
import { storage } from "@vendetta/plugin";
import { IconPack } from "./types";
import { reloadUI } from "./stuff/util";

export enum PatchType {
  Icons,
  UnreadBadgeColor,
  CustomIconOverlays,
  MentionLineColor,
  IconPack,
}

export let active: {
  active: boolean;
  iconpack: IconPack | null;
  patches: PatchType[];
} = {
  active: false,
  iconpack: null,
  patches: [],
};

export const vstorage: {
  iconpack?: {
    url: string | null;
    suffix: string;
  };
} = storage;

export let cacheID = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);

export let enabled = false;

let unpatch: () => void;
export async function runPatch() {
  enabled = true;
  unpatch = await patcher();
}
export function runUnpatch() {
  enabled = false;
  unpatch?.();
}

export default {
  onLoad: async () => {
    runPatch();
  },
  onUnload: () => {
    runUnpatch();
    reloadUI();
  },
  settings,
};
