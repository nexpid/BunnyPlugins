import { storage } from "@vendetta/plugin";
import patcher from "./stuff/patcher";
import Settings from "./components/Settings";

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
