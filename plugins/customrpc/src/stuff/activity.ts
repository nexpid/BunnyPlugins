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
import { z } from "zod";

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

export const SettingsActivity = z.object({
  app: z.object({
    name: z.string().optional(),
    id: z.string().optional(),
  }),
  state: z.string().optional(),
  details: z.string().optional(),
  timestamps: z.object({
    start: z.string().or(z.number()).optional(),
    end: z.string().or(z.number()).optional(),
  }),
  assets: z.object({
    largeImg: z.string().optional(),
    smallImg: z.string().optional(),
  }),
  buttons: z.array(
    z.object({
      text: z.string(),
      url: z.string().optional(),
    })
  ),
  type: z.nativeEnum(ActivityType),
});

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

  if (at.assets.large_image && at.type === ActivityType.Playing)
    at.assets.large_text = "CRPC@VD";

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
