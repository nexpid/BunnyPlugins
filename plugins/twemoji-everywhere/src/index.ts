import { ReactNative as RN } from "@vendetta/metro/common";

import { Lang } from "$/lang";
import { makeStorage } from "$/storage";

import settings from "./components/Settings";
import patcher from "./stuff/patcher";
import { emojipacks } from "./stuff/twemoji";

export const vstorage = makeStorage({
  emojipack: RN.Platform.select({
    default: "default",
    ios: "twemoji",
  }) as keyof typeof emojipacks,
});

export const lang = new Lang("twemoji_everywhere");

let unpatch: () => void;
export default {
  onLoad: () => (unpatch = patcher()),
  onUnload: () => unpatch?.(),
  settings,
};
