import { storage } from "@vendetta/plugin";
import patcher from "./stuff/patcher";
import Settings from "./components/Settings";

export const vstorage: {
  position?: "pill" | "inside";
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
