import { storage } from "@vendetta/plugin";
import patcher from "./stuff/patcher";
import { createStorage, wrapSync } from "@vendetta/storage";
import { plugins } from "@vendetta/plugins";
import { themes } from "@vendetta/themes";
import settings from "./components/Settings";
import { HiddenListEntry, HiddenListEntryType } from "./types.d";

export const hiddenList: { list: HiddenListEntry[] } = wrapSync(
  createStorage({
    get: () => storage.hidden ?? { list: [] },
    set: (x) => {
      storage.hidden = x;
    },
  })
);

export function isHidden(type: HiddenListEntryType, id: string | number) {
  return hiddenList.list.some((x) => x[0] === type && x[1] === id);
}
export function addHidden(type: HiddenListEntryType, id: string | number) {
  if (!isHidden(type, id))
    hiddenList.list = [
      ...hiddenList.list,
      type === HiddenListEntryType.Folder
        ? [type, id as number]
        : [type, id as string],
    ];
}
export function removeHidden(type: HiddenListEntryType, id: string | number) {
  hiddenList.list = hiddenList.list.filter((x) => x[0] !== type || x[1] !== id);
}

export const emitterSymbol = Symbol.for("vendetta.storage.emitter");
export const emitterAvailable =
  !!(plugins as any)[emitterSymbol] && !!(themes as any)[emitterSymbol];

let unpatch: () => void;
export default {
  onLoad: () => (unpatch = patcher()),
  onUnload: () => unpatch?.(),
  settings,
};
