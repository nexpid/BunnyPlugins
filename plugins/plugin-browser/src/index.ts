import { Lang } from "$/lang";
import { makeStorage } from "$/storage";

import patcher from "./stuff/patcher";

export const pluginsURL =
  "https://vd-plugins.github.io/proxy/plugins-full.json";

export const vstorage = makeStorage({
  pluginCache: new Array<string>(),
});

export const lang = new Lang("plugin_browser");

let unpatch;
export default {
  onLoad: () => (unpatch = patcher()),
  onUnload: () => (unpatch?.(), lang.unload()),
};
