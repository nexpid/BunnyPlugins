import patcher from "./stuff/patcher";

let patches;
export default {
  onLoad: () => (patches = patcher()),
  onUnload: () => patches?.(),
};
