import { safeFetch } from "@vendetta/utils";

import { IconPackConfig } from "../types";
import constants from "./constants";

export default async function getIconpackData(
  id: string,
  configUrl?: string,
): Promise<{
  config: IconPackConfig | null;
  tree: string[] | null;
}> {
  const ignore = Symbol();
  const [config, tree] = await Promise.allSettled([
    configUrl
      ? safeFetch(configUrl, {
          headers: { "cache-control": "public, max-age=60" },
        }).then((x) => x.json())
      : async () => ignore,
    safeFetch(constants.iconpacks.tree(id), {
      headers: { "cache-control": "public, max-age=60" },
    })
      .then((x) => x.text())
      .then((x) => x.replaceAll("\r", "").split("\n")),
  ]);
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
