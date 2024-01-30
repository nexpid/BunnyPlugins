import { makeStorage } from "$/storage";

import Settings from "./components/Settings";
import patcher from "./stuff/patcher";

export const vstorage = makeStorage({
  buttonType: "pill",
  previewType: "popup",
});

let unpatch;
export default {
  onLoad: () => (unpatch = patcher()),
  onUnload: () => unpatch?.(),
  settings: Settings,
};
