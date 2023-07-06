import { findByStoreName } from "@vendetta/metro";
import { RawActivity } from "./activity";
import { getExternalAsset, proxyAssetCache } from "./api";
import { statusLinks, unparseTimestamp } from "./util";
import { forceUpdateActivity, registerChangeFluxEvent } from "./autochange";
import { getUserAvatar } from "../../../../stuff/types";

const UserStore = findByStoreName("UserStore");
const SpotifyStore = findByStoreName("SpotifyStore");
const PresenceStore = findByStoreName("PresenceStore");

export enum VariableType {
  CurrentUser,
  CurrentUserPresence,
}

export const varCache: {
  presence: {
    status: string | undefined;
    custom: any | undefined;
    spotify: any | null;
  };
} = {
  presence: {
    status: undefined,
    custom: undefined,
    spotify: null,
  },
};

export const getCustomActivity = (from?: any) =>
  (from ?? PresenceStore.getActivities(UserStore.getCurrentUser().id)).find(
    (x: RawActivity) => x.type === 4
  );

export const stringVariables: {
  match: string;
  meta: {
    description: string;
  };
  types: VariableType[];
  replace: () => string;
}[] = [
  {
    match: "{user.name}",
    meta: {
      description: "your username",
    },
    types: [VariableType.CurrentUser],
    replace: () => UserStore.getCurrentUser().username,
  },
  {
    match: "{user.displayname}",
    meta: {
      description: "your display name",
    },
    types: [VariableType.CurrentUser],
    replace: () => UserStore.getCurrentUser().globalName,
  },
  {
    match: "{user.status}",
    meta: {
      description: "your status",
    },
    types: [VariableType.CurrentUserPresence],
    replace: () => getCustomActivity()?.label ?? "No Status",
  },
  {
    match: "{user.presence}",
    meta: {
      description: "your presence (online/dnd/idle/invisible)",
    },
    types: [VariableType.CurrentUserPresence],
    replace: () => PresenceStore.getStatus(UserStore.getCurrentUser().id),
  },

  {
    match: "{spotify.track}",
    meta: {
      description: "your playing Spotify track (Thot K)",
    },
    types: [VariableType.CurrentUserPresence],
    replace: () => SpotifyStore.getActivity()?.details ?? "No Spotify Track",
  },
  {
    match: "{spotify.track.url}",
    meta: {
      description: "your playing Spotify track's share link",
    },
    types: [VariableType.CurrentUserPresence],
    replace: () => {
      const track = SpotifyStore.getActivity()?.sync_id;
      return track ? `https://open.spotify.com/track/${track}` : "";
    },
  },
  {
    match: "{spotify.artist}",
    meta: {
      description: "your playing Spotify track's artist(s) (iluvern!)",
    },
    types: [VariableType.CurrentUserPresence],
    replace: () =>
      (varCache.presence.spotify = SpotifyStore.getActivity())?.state ??
      "No Spotify Track",
  },
  {
    match: "{spotify.album}",
    meta: {
      description: "your playing Spotify track's album (iluvern!)",
    },
    types: [VariableType.CurrentUserPresence],
    replace: () =>
      (varCache.presence.spotify = SpotifyStore.getActivity())?.assets
        ?.large_text ?? "No Spotify Track",
  },
];

export interface ParsedVariableString {
  content: string;
  types: VariableType[];
}
export function parseVariableString(str: string): ParsedVariableString {
  const data = {
    content: str,
    types: [],
  };

  for (const x of stringVariables) {
    let rep: string | undefined;
    data.content = data.content.replaceAll(x.match, () => {
      for (const y of x.types) if (!data.types.includes(y)) data.types.push(y);
      return rep ?? (rep = x.replace());
    });
  }

  return data;
}

export const timestampVariables: {
  title: string;
  description: string;
  format: string;
  type: VariableType;
  replace: () => number | undefined;
}[] = [
  {
    title: "Spotify Track Start",
    description: "The timestamp when your playing Spotify track sarstarted",
    format: "spotify.track.start",
    type: VariableType.CurrentUserPresence,
    replace: () =>
      (varCache.presence.spotify = SpotifyStore.getActivity())?.timestamps
        ?.start,
  },
  {
    title: "Spotify Track End",
    description: "The timestamp when your playing Spotify track ends",
    format: "spotify.track.end",
    type: VariableType.CurrentUserPresence,
    replace: () =>
      (varCache.presence.spotify = SpotifyStore.getActivity())?.timestamps?.end,
  },
];

export interface ParsedVariableTimestamp {
  timestamp: number | undefined;
  type?: VariableType;
}
export function parseVariableTimestamp(
  timestamp: string | number
): ParsedVariableTimestamp {
  if (typeof timestamp === "string") {
    const varib = timestampVariables.find((x) => x.format === timestamp);
    const rep = varib?.replace();

    if (varib)
      return {
        timestamp: rep !== undefined ? unparseTimestamp(rep) : undefined,
        type: varib.type,
      };
    else return { timestamp: 0 };
  } else return { timestamp };
}

export const imageVariables: {
  title: string;
  description: string;
  format: string;
  type: VariableType;
  replace: () => string | undefined;
}[] = [
  {
    title: "User Avatar",
    description: "Your avatar",
    format: "user.avatar",
    type: VariableType.CurrentUser,
    replace: () => {
      const user = UserStore.getCurrentUser();

      const url = getUserAvatar({
        discriminator: user.discriminator,
        id: user.id,
        avatar: user.avatar,
      });
      if (!proxyAssetCache[url])
        getExternalAsset(url).then(forceUpdateActivity);

      return `mp:${proxyAssetCache[url]}`;
    },
  },
  {
    title: "User Presence",
    description: "Your presence (online/idle/dnd/invisible)",
    format: "user.presence",
    type: VariableType.CurrentUserPresence,
    replace: () =>
      statusLinks[PresenceStore.getStatus(UserStore.getCurrentUser().id)] ??
      statusLinks.online,
  },
  {
    title: "Spotify Album Cover",
    description: "Your playing Spotify track's album cover",
    format: "spotify.album",
    type: VariableType.CurrentUserPresence,
    replace: () => SpotifyStore.getActivity()?.assets?.large_image,
  },
];

export interface ParsedVariableImage {
  image: string | undefined;
  type?: VariableType;
}
export function parseVariableImage(image: string): ParsedVariableImage {
  const varib = imageVariables.find((x) => x.format === image);
  if (varib) return { image: varib.replace(), type: varib.type };
  else return { image };
}

export function registerVariableEvents(types: VariableType[]) {
  for (const x of types)
    if (x === VariableType.CurrentUser)
      registerChangeFluxEvent(
        "parsed.currentuser",
        "CURRENT_USER_UPDATE",
        forceUpdateActivity
      );
    else if (x === VariableType.CurrentUserPresence)
      registerChangeFluxEvent(
        "parsed.currentuserpresence",
        "SELF_PRESENCE_STORE_UPDATE",
        (x) => {
          if (
            varCache.presence.status !== x.status ||
            JSON.stringify(varCache.presence.custom) !==
              JSON.stringify(getCustomActivity(x.activities)) ||
            JSON.stringify(varCache.presence.spotify) !==
              JSON.stringify(SpotifyStore.getActivity())
          )
            forceUpdateActivity();
          varCache.presence = {
            status: x.status,
            custom: getCustomActivity(x.activities),
            spotify: SpotifyStore.getActivity(),
          };
        }
      );
}
