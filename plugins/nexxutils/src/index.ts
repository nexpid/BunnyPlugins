import { storage } from "@vendetta/plugin";
import modules from "./modules";
import settings from "./components/Settings";
import devtools from "./stuff/devtools";

export const vstorage: {
  modules?: Record<
    string,
    {
      enabled: boolean;
      options: Record<string, any>;
    }
  >;
} = storage;

export const version = "0.1.9";

let undevtool: () => void;

export default {
  onLoad: () => {
    vstorage.modules ??= {};
    modules.forEach((x) => (x.storage.enabled ? x.start() : x.stop()));
    undevtool = devtools();
  },
  onUnload: () => (
    modules.forEach((x) => x.storage.enabled && x.stop()), undevtool?.()
  ),
  settings,
};
