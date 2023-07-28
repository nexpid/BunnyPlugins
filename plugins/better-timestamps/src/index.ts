import settings from "./components/Settings";
import { storage } from "@vendetta/plugin";
import patcher from "./stuff/patcher";

export const vstorage: {
  time?: {
    acceptRelative: boolean;
    requireBackticks: boolean;
  };
  day?: {
    acceptRelative: boolean;
    requireBackticks: boolean;
    american: boolean;
  };
} = storage;

let unpatch;
export default {
  onLoad: () => (unpatch = patcher()),
  onUnload: () => unpatch?.(),
  settings,
};
