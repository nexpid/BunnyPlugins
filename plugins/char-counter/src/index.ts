import { storage } from "@vendetta/plugin";

import Settings from "./components/Settings";
import patcher from "./stuff/patcher";

export const vstorage: {
  position?: "pill" | "inside";
  display?: "full" | "length" | "remaining";
  commas?: boolean;
  minChars?: number;
  supportSLM?: boolean;
} = storage;

let unpatch;
export default {
  onLoad: () => (unpatch = patcher()),
  onUnload: () => unpatch?.(),
  settings: Settings,
};
