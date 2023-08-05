import patcher from "./stuff/patcher";
import Settings from "./components/Settings";

export enum PatchType {
  Icons,
  UnreadBadgeColor,
  CustomIconOverlays,
  MentionLineColor,
  IconPack,
}
export const patchTypeReadable = Object.fromEntries([
  [PatchType.Icons, "Custom icon colors"],
  [PatchType.UnreadBadgeColor, "Unread badge color"],
  [PatchType.CustomIconOverlays, "Custom icon overlays"],
  [PatchType.MentionLineColor, "Mention line color"],
  [PatchType.IconPack, "Custom icon pack"],
]);

export let active: {
  active: boolean;
  patches: PatchType[];
} = {
  active: false,
  patches: [],
};

export let enabled = false;
let patches: () => void;
export default {
  onLoad: async () => {
    enabled = true;
    patches = await patcher();
  },
  onUnload: () => {
    enabled = false;
    patches?.();
  },
  settings: Settings,
};
