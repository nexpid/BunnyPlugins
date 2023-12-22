import { plugins } from "@vendetta";
import { safeFetch } from "@vendetta/utils";

import { pluginsURL, vstorage } from "..";
import { PluginsFullJson } from "../types";

let lastPluginCache: Record<string, string> = {};
export function getChanges(): [string, "new" | "update"][] {
  if (!Object.keys(lastPluginCache)[0] || !vstorage.pluginCache?.[0]) return [];
  return Object.entries(lastPluginCache)
    .map(([id, hash]) =>
      !vstorage.pluginCache?.includes(id)
        ? [id, "new"]
        : plugins.plugins[id] && plugins.plugins[id].manifest.hash !== hash
          ? [id, "update"]
          : undefined,
    )
    .filter((x) => !!x) as [string, "new" | "update"][];
}

export function updateChanges() {
  vstorage.pluginCache = Object.keys(lastPluginCache);
}

export async function run() {
  const res = (await (
    await safeFetch(pluginsURL, { cache: "no-store" })
  ).json()) as PluginsFullJson;
  lastPluginCache = Object.fromEntries(
    res.map((x) => [
      `https://vd-plugins.github.io/proxy/${x.vendetta.original}`,
      x.hash,
    ]),
  );
}

export function initThing(): () => void {
  const interval = setInterval(run, 1000 * 60 * 10);
  run();

  return () => clearInterval(interval);
}
