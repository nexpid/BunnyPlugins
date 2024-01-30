import { makeStorage } from "$/storage";

import patcher from "./stuff/patcher";

export const pluginsURL =
  "https://vd-plugins.github.io/proxy/plugins-full.json";

export const vstorage = makeStorage({
  pluginCache: new Array<string>(),
});

let unpatch;
export default {
  onLoad: () => (unpatch = patcher()),
  onUnload: () => unpatch?.(),
};
