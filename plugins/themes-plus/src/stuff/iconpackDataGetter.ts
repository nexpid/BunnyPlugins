import { safeFetch } from "@vendetta/utils";

import { vstorage } from "..";
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

  // save to cache!!!
  if (config.status === "fulfilled" && config.value !== ignore)
    vstorage.cache.links[configUrl] = JSON.stringify(config.value);
  if (tree.status === "fulfilled" && tree.value)
    vstorage.cache.links[treeUrl] = JSON.stringify(tree.value);

  // read from cache!!!
  if (config.status === "rejected" && vstorage.cache.links[configUrl])
    config = {
      status: "fulfilled",
      value: JSON.parse(vstorage.cache.links[configUrl]),
    };
  if (tree.status === "rejected" && vstorage.cache.links[treeUrl])
    tree = {
      status: "fulfilled",
      value: JSON.parse(vstorage.cache.links[treeUrl]),
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
