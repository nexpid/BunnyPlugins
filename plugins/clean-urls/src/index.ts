import patcher from "./stuff/patcher";

export const listUrl = `https://raw.githubusercontent.com/nexpid/VendettaPlugins/main/plugins/clean-urls/assets/list.json`;

let unpatch: () => void;

export default {
  onLoad: () => (unpatch = patcher()),
  onUnload: () => unpatch?.(),
};
