import { FluxDispatcher } from "@vendetta/metro/common";
import { placeholders } from "../components/Settings";
import { debug, vstorage } from "..";
import { unregisterChanges } from "./autochange";
import {
  VariableType,
  imageVariables,
  parseVariableImage,
  parseVariableString,
  parseVariableTimestamp,
  registerVariableEvents,
  timestampVariables,
} from "./variables";
import { displayImage, parseTimestamp } from "./util";
import { isObject } from "../../../../stuff/types";
import { forceUpdateLiveRawActivityView } from "../components/pages/LiveRawActivityView";

export interface RawActivity {
  name: string;
  application_id?: string;
  type?: number;
  flags: number;
  state?: string;
  details?: string;
  timestamps?: {
    start?: number;
    end?: number;
  };
  assets?: {
    large_image?: string;
    large_text?: string;
    small_image?: string;
    small_text?: string;
  };
  metadata?: {
    button_urls?: string[];
  };
  buttons?: string[];
}
export interface SettingsActivity {
  app: {
    name?: string;
    id?: string;
  };
  state?: string;
  details?: string;
  timestamps: {
    start?: string | number;
    end?: string | number;
  };
  assets: {
    largeImg?: string;
    smallImg?: string;
  };
  buttons: {
    text: string;
    url?: string;
  }[];
  type?: ActivityType;
}

export enum ActivityType {
  Playing = 0,
  Listening = 2,
  Watching = 3,
  Competing = 5,
}

// TODO support activity flags
export enum ActivityFlags {
  Instance = 1 << 0,
  Join = 1 << 1,
  Spectate = 1 << 2,
  JoinRequest = 1 << 3,
  Sync = 1 << 4,
  Play = 1 << 5,
  PartyPrivacyFriends = 1 << 6,
  PartyPrivacyVoiceChannel = 1 << 7,
  Embedded = 1 << 8,
}

export function checkSettingsActivity(activity: Partial<SettingsActivity>) {
  // sorry to whoever is checking this code :P
  if (!isObject(activity)) return false;

  if (!isObject(activity.app)) return false;
  if ("name" in activity.app && typeof activity.app.name !== "string")
    return false;
  if ("id" in activity.app && typeof activity.app.id !== "string") return false;

  if ("state" in activity && typeof activity.state !== "string") return false;
  if ("details" in activity && typeof activity.details !== "string")
    return false;

  if (!isObject(activity.timestamps)) return false;
  if (
    "start" in activity.timestamps &&
    !(
      typeof activity.timestamps.start === "number" ||
      timestampVariables.find(
        (x) => x.format === (activity.timestamps.start as string)
      )
    )
  )
    return false;
  if (
    "end" in activity.timestamps &&
    !(
      typeof activity.timestamps.end === "number" ||
      timestampVariables.find(
        (x) => x.format === (activity.timestamps.end as string)
      )
    )
  )
    return false;

  if (!isObject(activity.assets)) return false;
  if (
    "largeImg" in activity.assets &&
    (typeof activity.assets.largeImg !== "string" ||
      !(
        displayImage(activity.assets.largeImg) ||
        imageVariables.find((x) => x.format === activity.assets.largeImg)
      ))
  )
    return false;
  if (
    "smallImg" in activity.assets &&
    (typeof activity.assets.smallImg !== "string" ||
      !(
        displayImage(activity.assets.smallImg) ||
        imageVariables.find((x) => x.format === activity.assets.smallImg)
      ))
  )
    return false;

  if (!Array.isArray(activity.buttons)) return false;
  for (const x of activity.buttons)
    if (
      !("text" in x) ||
      typeof x.text !== "string" ||
      ("url" in x && typeof x.url !== "string")
    )
      return false;

  if ("type" in activity && !(activity.type in ActivityType)) return false;

  return true;
}
export function cleanSettingsActivity(
  activity: SettingsActivity
): SettingsActivity {
  return {
    app: {
      name: activity.app.name,
      id: activity.app.id,
    },
    state: activity.state,
    details: activity.details,
    timestamps: {
      start: activity.timestamps.start,
      end: activity.timestamps.end,
    },
    assets: {
      largeImg: activity.assets.largeImg,
      smallImg: activity.assets.smallImg,
    },
    buttons: activity.buttons.map((x) => ({
      text: x.text,
      url: x.url,
    })),
    type: activity.type,
  };
}

export function makeEmptySettingsActivity(): SettingsActivity {
  return {
    timestamps: {},
    assets: {},
    buttons: [],
    app: {},
  };
}
export function settingsActivityToRaw(activity: SettingsActivity): {
  activity: RawActivity;
  types: VariableType[];
} {
  const types: VariableType[] = [];

  const handleVar = {
    str: (str: string): string => {
      const vr = parseVariableString(str);
      for (const x of vr.types) if (!types.includes(x)) types.push(x);
      return vr.content;
    },
    tim: (tim: number | string): number | undefined => {
      const vr = parseVariableTimestamp(tim);
      if (vr.type && !types.includes(vr.type)) types.push(vr.type);

      return vr.timestamp !== undefined
        ? parseTimestamp(vr.timestamp)
        : undefined;
    },
    img: (img: string): string | undefined => {
      const vr = parseVariableImage(img);
      if (vr.type && !types.includes(vr.type)) types.push(vr.type);
      return vr.image;
    },
  };

  const at: RawActivity = {
    name: handleVar.str(activity.app.name ?? placeholders.appName),
    application_id: activity.app.id ?? "0",
    type: activity.type ?? ActivityType.Playing,
    flags: ActivityFlags.Instance,
    state: activity.state && handleVar.str(activity.state),
    details: activity.details && handleVar.str(activity.details),
    timestamps: {
      start:
        activity.timestamps.start !== undefined
          ? handleVar.tim(activity.timestamps.start)
          : undefined,
      end:
        activity.timestamps.end !== undefined
          ? handleVar.tim(activity.timestamps.end)
          : undefined,
    },
    assets: {
      large_image:
        activity.assets.largeImg && handleVar.img(activity.assets.largeImg),
      small_image:
        activity.assets.smallImg && handleVar.img(activity.assets.smallImg),
    },
  };

  if (at.assets.large_image) at.assets.large_text = "CRPC@VD";

  if (activity.buttons[0]) {
    at.metadata = {
      button_urls: activity.buttons
        .slice(0, 2)
        .filter((x) => !!x.text)
        .map((x) => (x.url ? handleVar.str(x.url) : null)),
    };
    at.buttons = activity.buttons
      .slice(0, 2)
      .filter((x) => !!x.text)
      .map((x) => handleVar.str(x.text));
  }

  debug.lastRawActivity = at;
  debug.lastRawActivityTimestamp = Date.now();
  forceUpdateLiveRawActivityView?.();

  return {
    activity: at,
    types,
  };
}

export async function dispatchActivity(
  activity?: SettingsActivity
): Promise<void> {
  let send = {};

  unregisterChanges();
  if (activity) {
    const parsed = settingsActivityToRaw(activity);
    send = parsed.activity;
    registerVariableEvents(parsed.types);
  }

  FluxDispatcher.dispatch({
    type: "LOCAL_ACTIVITY_UPDATE",
    activity: send,
    socketId: "CustomRPC@Vendetta", // based on Last.fm plugin
  });
}

export function getSavedActivity(): SettingsActivity {
  return (
    vstorage.profiles?.[vstorage.activity?.profile] ??
    vstorage.activity?.editing ??
    makeEmptySettingsActivity()
  );
}

export function dispatchActivityIfPossible(): void {
  const activity = getSavedActivity();
  if (vstorage.settings?.display) dispatchActivity(activity);
  else dispatchActivity();
}

export function isActivitySaved(): boolean {
  const a = getSavedActivity();
  return JSON.stringify(a) === JSON.stringify(vstorage.activity.editing);
}
