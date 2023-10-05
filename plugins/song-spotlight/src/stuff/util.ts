import { API } from "../types/api";

export const rebuildLink = (
  service: API.Song["service"],
  type: API.Song["type"],
  id: API.Song["id"]
): string =>
  service === "spotify" ? `https://open.spotify.com/${type}/${id}` : undefined;
