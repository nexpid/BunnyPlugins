import { cache } from "..";
import { syncSaveData } from "./api";

let syncTimeout = 0;
export function hsync(run: () => void) {
  clearTimeout(syncTimeout);
  syncTimeout = setTimeout(run, 1500);
}

let rcache: string;
export function check() {
  const snapshot = rcache?.slice();
  rcache = JSON.stringify(cache.data);

  if (snapshot && snapshot !== JSON.stringify(cache.data))
    hsync(() => syncSaveData(cache.data.songs));
}
