import { vstorage } from "..";
import { useCacheStore } from "../stores/CacheStore";

export function customUrl() {
  const url = vstorage.iconpack.custom.url;
  return url.length > 1 && (!url.endsWith("/") ? `${url}/` : url);
}

export function fixPath(path: string) {
  return path.startsWith("../") ? `_/${path.slice(3)}` : path;
}
export function flattenFilePath(path: string) {
  return path.replace(/[\\/]/g, "_").replace(/-/g, "");
}

export function cFetch(
  url: RequestInfo,
  init?: RequestInit,
  format?: "text",
): Promise<string>;
export function cFetch<JsonType>(
  url: RequestInfo,
  init?: RequestInit,
  format?: "json",
): Promise<JsonType>;

export async function cFetch(
  url: RequestInfo,
  init?: RequestInit,
  format = "text",
) {
  const cache = useCacheStore.getState();
  const rawUrl = typeof url === "string" ? url : url.url;

  const res = await fetch(url, init);

  let ret: string;
  if (res.status !== 200) {
    if (cache.isCached(rawUrl)) ret = cache.readCache(rawUrl);
    else throw new Error(`Failed to fetch ${url}`);
  } else {
    ret = await res.text();
    cache.writeCache(rawUrl, ret);
  }

  if (format === "json") return JSON.parse(ret);
  else return ret;
}

export function formatBytes(bytes: number) {
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  if (bytes === 0) return "0 B";

  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
}
