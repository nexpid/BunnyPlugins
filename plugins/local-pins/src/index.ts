import { storage } from "@vendetta/plugin";

import settings from "./components/Settings";
import patcher from "./stuff/patcher";

export const vstorage: {
  pinned?: Record<string, { id: string; pinned: number }[]>;
  preferFilters?: ("server" | "local")[];
} = storage;

// TODO add some kind of compression
export function getPins(channel: string) {
  return vstorage.pinned?.[channel];
}
export function clearPins(channel: string) {
  vstorage.pinned ??= {};
  delete vstorage.pinned?.[channel];
}
export function hasPin(channel: string, id: string) {
  return vstorage.pinned?.[channel]?.some((x) => x.id === id);
}
export function addPin(channel: string, id: string) {
  vstorage.pinned ??= {};
  vstorage.pinned[channel] ??= [];
  if (!hasPin(channel, id))
    vstorage.pinned[channel].push({ id, pinned: Date.now() });
}
export function removePin(channel: string, id: string) {
  vstorage.pinned ??= {};
  vstorage.pinned[channel] = (vstorage.pinned[channel] ?? []).filter(
    (x) => x.id !== id,
  );
}

let unpatch: () => void;
export default {
  onLoad: () => (unpatch = patcher()),
  onUnload: () => unpatch(),
  settings,
};
