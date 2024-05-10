import { vstorage } from "..";

export function customUrl() {
  const url = vstorage.iconpack.custom.url;
  return url.length > 1 && (!url.endsWith("/") ? `${url}/` : url);
}
