import { storage } from "@vendetta/plugin";

import { Lang } from "$/lang";

import Settings from "./components/Settings";
import patcher from "./stuff/patcher";

export const vstorage = storage as {
  appearStyle: "fly" | "fade";
  swinging: boolean;
  bounce: boolean;
};

export const lang = new Lang("kiryu_facecam");

let unpatch: () => void;

export default {
  onLoad: () => {
    vstorage.appearStyle ??= "fly";
    vstorage.swinging ??= true;
    vstorage.bounce ??= true;
    unpatch = patcher();
  },
  onUnload: () => unpatch?.(),
  settings: Settings,
};
