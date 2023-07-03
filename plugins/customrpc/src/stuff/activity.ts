import { FluxDispatcher } from "@vendetta/metro/common";
import { placeholders } from "../components/Settings";
import { vstorage } from "..";

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
    small_image?: string;
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
    start?: number;
    end?: number;
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

export function checkSettingsActivity(activity: SettingsActivity) {
  // i'm terribly sorry to anyone reading this code
  if (
    Array.isArray(activity) ||
    typeof activity != "object" ||
    ("state" in activity && typeof activity.state != "string") ||
    ("details" in activity && typeof activity.details != "string") ||
    Array.isArray(activity.timestamps) ||
    typeof activity.timestamps != "object" ||
    ("start" in activity.timestamps &&
      typeof activity.timestamps.start != "number") ||
    ("end" in activity.timestamps &&
      typeof activity.timestamps.end != "number") ||
    Array.isArray(activity.assets) ||
    typeof activity.assets != "object" ||
    ("largeImg" in activity.assets &&
      typeof activity.assets.largeImg == "string" &&
      Number.isNaN(Number(activity.assets.largeImg)) &&
      !activity.assets.largeImg.startsWith("mp:")) ||
    ("smallImg" in activity.assets &&
      typeof activity.assets.smallImg == "string" &&
      Number.isNaN(Number(activity.assets.smallImg)) &&
      !activity.assets.smallImg.startsWith("mp:")) ||
    !Array.isArray(activity.buttons)
  )
    return false;
  for (const b of activity.buttons)
    if (
      !("text" in b && typeof b.text !== "string") ||
      ("url" in b && typeof b.url != "string")
    )
      return false;
  return !(
    ("name" in activity.app && typeof activity.app.name != "string") ||
    ("id" in activity.app && Number.isNaN(Number(activity.app.id))) ||
    ("type" in activity && !(activity.type in ActivityType))
  );
}
export function makeEmptySettingsActivity(): SettingsActivity {
  return {
    timestamps: {},
    assets: {},
    buttons: [],
    app: {},
  };
}
export function settingsActivityToRaw(activity: SettingsActivity): RawActivity {
  const at: RawActivity = {
    name: activity.app.name ?? placeholders.appName,
    application_id: activity.app.id ?? "0",
    type: activity.type ?? ActivityType.Playing,
    flags: 1,
    state: activity.state,
    details: activity.details,
    timestamps: activity.timestamps,
    assets: {
      large_image: activity.assets.largeImg,
      small_image: activity.assets.smallImg,
    },
  };

  if (activity.buttons[0]) {
    at.metadata = {
      button_urls: activity.buttons.slice(0, 2).map((x) => x.url),
    };
    at.buttons = activity.buttons.slice(0, 2).map((x) => x.text);
  }

  return at;
}

export function dispatchActivity(activity: RawActivity | {}): void {
  FluxDispatcher.dispatch({
    type: "LOCAL_ACTIVITY_UPDATE",
    activity,
    socketId: "VendettaCustomRpcPlugin",
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
  if (vstorage.settings?.display)
    dispatchActivity(settingsActivityToRaw(activity));
  else dispatchActivity({});
}

export function isActivitySaved(): boolean {
  const a = getSavedActivity();
  return JSON.stringify(a) === JSON.stringify(vstorage.activity.editing);
}
