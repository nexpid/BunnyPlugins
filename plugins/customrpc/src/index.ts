import { storage } from "@vendetta/plugin";

import { RNMMKVManager } from "$/deps";

import settings from "./components/Settings";
import {
  dispatchActivity,
  dispatchActivityIfPossible,
  makeEmptySettingsActivity,
  RawActivity,
  SettingsActivity,
} from "./stuff/activity";
import { registerDefaultChanges, unregisterChanges } from "./stuff/autochange";
import PresetProfiles from "./stuff/presetProfiles";

export const vstorage = storage as {
  settings: {
    edit: boolean;
    display: boolean;
    debug: {
      enabled: boolean;
      visible: boolean;
      boykisserDead: boolean;
    };
  };
  activity: {
    profile?: string;
    editing: SettingsActivity;
  };
  profiles: Record<string, SettingsActivity>;
};

export const debug: {
  lastRawActivity: RawActivity | undefined;
  lastRawActivityTimestamp: number | undefined;
} = {
  lastRawActivity: undefined,
  lastRawActivityTimestamp: undefined,
};

export default {
  onLoad: async () => {
    vstorage.settings ??= {
      edit: false,
      display: false,
      debug: {
        enabled: false,
        visible: false,
        boykisserDead: false,
      },
    };
    vstorage.activity ??= {
      editing: makeEmptySettingsActivity(),
    };
    vstorage.profiles ??= PresetProfiles;

    if (vstorage.settings.debug)
      vstorage.settings.debug.boykisserDead =
        (await RNMMKVManager.getItem("CRPC_boykisser")) === "true";
    dispatchActivityIfPossible();
    registerDefaultChanges();
  },
  onUnload: () => {
    dispatchActivity();
    unregisterChanges(true);
  },
  settings,
};
