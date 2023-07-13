import { storage } from "@vendetta/plugin";
import {
  RawActivity,
  SettingsActivity,
  dispatchActivity,
  dispatchActivityIfPossible,
} from "./stuff/activity";
import settings from "./components/Settings";
import { registerDefaultChanges, unregisterChanges } from "./stuff/autochange";

const { MMKVManager } = window.nativeModuleProxy;

export const vstorage: {
  settings?: {
    edit: boolean;
    display: boolean;
    debug?: {
      enabled?: boolean;
      visible?: boolean;
      boykisserDead?: boolean;
    };
  };
  activity?: {
    profile?: string;
    editing: SettingsActivity;
  };
  profiles?: Record<string, SettingsActivity>;
} = storage;

export const debug: {
  lastRawActivity: RawActivity | undefined;
  lastRawActivityTimestamp: number | undefined;
} = {
  lastRawActivity: undefined,
  lastRawActivityTimestamp: undefined,
};

export default {
  onLoad: async () => {
    if (vstorage.settings.debug)
      vstorage.settings.debug.boykisserDead =
        (await MMKVManager.getItem("CRPC_boykisser")) === "true";
    dispatchActivityIfPossible();
    registerDefaultChanges();
  },
  onUnload: () => {
    dispatchActivity();
    unregisterChanges(true);
  },
  settings,
};
