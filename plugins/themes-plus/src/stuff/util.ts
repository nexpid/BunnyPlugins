import { vstorage } from "..";

export function customUrl() {
  const url = vstorage.iconpack.custom.url;
  return url.length > 1 && (!url.endsWith("/") ? `${url}/` : url);
}

export function fixPath(path: string) {
  return path.startsWith("../") ? `_/${path.slice(3)}` : path;
}

/**
  downloading iconpacks 101

  - get iconpack tree
  - filter files that end with: .png, .jpg, .webm, .lottie (tba)
  - download all images


 */
