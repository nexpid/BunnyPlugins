import { makeStorage } from "$/storage";

import Settings from "./components/Settings";
import patcher from "./stuff/patcher";

export const vstorage = makeStorage({
  position: "pill",
  display: "full",
  commas: true,
  minChars: 1,
  supportSLM: true,
});

let unpatch;
export default {
  onLoad: () => (unpatch = patcher()),
  onUnload: () => unpatch?.(),
  settings: Settings,
};
