import { storage } from "@vendetta/plugin";
import {
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
  };
  activity?: {
    profile?: string;
    editing: SettingsActivity;
  };
  profiles?: Record<string, SettingsActivity>;
} = storage;

export default {
  onLoad: () => {
    dispatchActivityIfPossible();
    registerDefaultChanges();
  },
  onUnload: () => {
    dispatchActivity({});
    unregisterChanges(true);
  },
  settings,
};
