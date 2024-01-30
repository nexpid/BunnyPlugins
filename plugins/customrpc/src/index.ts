import { RNMMKVManager } from "$/deps";
import { makeStorage } from "$/storage";

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

export const vstorage = makeStorage({
  settings: {
    edit: false,
    display: false,
    debug: {
      enabled: false,
      visible: false,
      boykisserDead: false,
    },
  },
  activity: {
    profile: undefined as string | undefined,
    editing: makeEmptySettingsActivity(),
  },
  profiles: PresetProfiles as Record<string, SettingsActivity>,
});

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
