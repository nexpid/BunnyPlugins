import { storage } from "@vendetta/plugin";

import patcher from "./stuff/patcher";

export const pluginsURL =
  "https://vd-plugins.github.io/proxy/plugins-full.json";

export const vstorage: {
  pluginCache?: string[];
} = storage;

let unpatch;
export default {
  onLoad: () => (unpatch = patcher()),
  onUnload: () => unpatch?.(),
};
