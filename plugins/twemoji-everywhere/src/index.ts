import { storage } from "@vendetta/plugin";
import patcher from "./stuff/patcher";
import { emojipacks } from "./stuff/twemoji";
import settings from "./components/Settings";

export const vstorage: {
  emojipack?: keyof typeof emojipacks;
} = storage;

let unpatch: () => void;
export default {
  onLoad: () => (unpatch = patcher()),
  onUnload: () => unpatch?.(),
  settings,
};
