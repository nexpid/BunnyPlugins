import { cache } from "..";
import { API } from "../types/api";
import { syncSaveData } from "./api";

let syncTimeout = 0;
export function hsync(run: () => void) {
  clearTimeout(syncTimeout);
  syncTimeout = setTimeout(run, 1500);
}

let rcache: API.Save;
export function check() {
  if (!rcache) return (rcache = cache.data);

  if (JSON.stringify(rcache) !== JSON.stringify(cache.data))
    hsync(async () => await syncSaveData(cache.data.songs));
}
