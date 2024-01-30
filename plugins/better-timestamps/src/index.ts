import { storage } from "@vendetta/plugin";

import { makeStorage } from "$/storage";

import settings from "./components/Settings";
import patcher from "./stuff/patcher";

export const vstoraga: {
  time?: {
    acceptRelative: boolean;
    requireBackticks: boolean;
  };
  day?: {
    acceptRelative: boolean;
    requireBackticks: boolean;
    american: boolean;
  };
} = storage;

export const vstorage = makeStorage({
  time: {
    acceptRelative: false,
    requireBackticks: true,
  },
  day: {
    acceptRelative: false,
    requireBackticks: true,
    american: false,
  },
});

let unpatch;
export default {
  onLoad: () => (unpatch = patcher()),
  onUnload: () => unpatch?.(),
  settings,
};
