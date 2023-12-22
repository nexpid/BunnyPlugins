import { ReactNative as RN } from "@vendetta/metro/common";
import { storage } from "@vendetta/plugin";

import settings from "./components/Settings";
import patcher from "./stuff/patcher";
import { emojipacks } from "./stuff/twemoji";

export const vstorage: {
  emojipack?: keyof typeof emojipacks;
} = storage;

vstorage.emojipack ??= RN.Platform.select({
  default: "default",
  ios: "twemoji",
});

let unpatch: () => void;
export default {
  onLoad: () => (unpatch = patcher()),
  onUnload: () => unpatch?.(),
  settings,
};
