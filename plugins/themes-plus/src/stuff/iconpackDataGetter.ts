import { safeFetch } from "@vendetta/utils";

import { useCacheStore } from "../stores/CacheStore";
import { IconpackConfig } from "../types";
import constants from "./constants";

export default async function getIconpackData(
  id: string,
  configUrl?: string,
): Promise<{
  config: IconpackConfig | null;
  tree: string[] | null;
}> {
  const ignore = Symbol();

  const treeUrl = constants.iconpacks.tree(id);
  let [config, tree] = await Promise.allSettled([
    configUrl
      ? safeFetch(configUrl, {
          headers: { "cache-control": "public, max-age=60" },
        }).then((x) => x.json())
      : async () => ignore,
    safeFetch(treeUrl, {
      headers: { "cache-control": "public, max-age=60" },
    })
      .then((x) => x.text())
      .then((x) => x.replaceAll("\r", "").split("\n")),
  ]);

  const cache = useCacheStore.getState();

  // save to cache!!!
  if (config.status === "fulfilled" && config.value !== ignore)
    cache.writeCache(configUrl, config.value);
  if (tree.status === "fulfilled" && tree.value)
    cache.writeCache(treeUrl, tree.value);

  // read from cache!!!
  if (config.status === "rejected" && cache.isCached(configUrl))
    config = {
      status: "fulfilled",
      value: cache.readCache(configUrl),
    };
  if (tree.status === "rejected" && cache.isCached(treeUrl))
    tree = {
      status: "fulfilled",
      value: cache.readCache(treeUrl),
    };

  return {
    config:
      config.status === "fulfilled"
        ? config.value === ignore
          ? false
          : config.value
        : null,
    tree: tree.status === "fulfilled" ? tree.value : null,
  };
}
