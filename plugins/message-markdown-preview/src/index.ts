import patcher from "./stuff/patcher";

let unpatch;
export default {
  onLoad: () => (unpatch = patcher()),
  onUnload: () => unpatch?.(),
};
