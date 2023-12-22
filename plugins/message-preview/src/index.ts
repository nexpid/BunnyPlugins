import { storage } from "@vendetta/plugin";

import Settings from "./components/Settings";
import patcher from "./stuff/patcher";

export const vstorage: {
  buttonType?: "pill" | "send";
  previewType?: "popup" | "clyde";
} = storage;

let unpatch;
export default {
  onLoad: () => (unpatch = patcher()),
  onUnload: () => unpatch?.(),
  settings: Settings,
};
