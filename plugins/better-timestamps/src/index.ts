import { storage } from "@vendetta/plugin";

import settings from "./components/Settings";
import patcher from "./stuff/patcher";

export const vstorage = storage as {
  time: {
    acceptRelative: boolean;
    requireBackticks: boolean;
  };
  day: {
    acceptRelative: boolean;
    requireBackticks: boolean;
    american: boolean;
  };
};

let unpatch: any;
export default {
  onLoad: () => {
    vstorage.time ??= {
      acceptRelative: false,
      requireBackticks: true,
    };
    vstorage.day ??= {
      acceptRelative: false,
      requireBackticks: true,
      american: false,
    };
    unpatch = patcher();
  },
  onUnload: () => unpatch?.(),
  settings,
};
