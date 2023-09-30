import patcher from "./stuff/patcher";

let unpatch: () => void;

export default {
  onLoad: () => (unpatch = patcher()),
  onUnload: () => unpatch?.(),
};
