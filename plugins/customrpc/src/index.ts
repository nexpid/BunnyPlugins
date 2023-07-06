import { storage } from "@vendetta/plugin";
import {
  RawActivity,
  SettingsActivity,
  dispatchActivity,
  dispatchActivityIfPossible,
} from "./stuff/activity";
import settings from "./components/Settings";
import { registerDefaultChanges, unregisterChanges } from "./stuff/autochange";

export const vstorage: {
  settings?: {
    edit: boolean;
    display: boolean;
    debug?: {
      enabled?: boolean;
      visible?: boolean;
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
  onLoad: () => {
    dispatchActivityIfPossible();
    registerDefaultChanges();
  },
  onUnload: () => {
    dispatchActivity();
    unregisterChanges(true);
  },
  settings,
};
