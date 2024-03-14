// temporary compability for various Vendetta forks

import { constants } from "@vendetta";

export function getClient() {
  const gh = constants.GITHUB;

  if ("bunny" in window) return "Bunny";

  if (gh.includes("vendetta-mod")) return "Vendetta";
  else if (gh.includes("revenge-mod")) return "Revenge";
  else return "UnknownClient";
}

export function pluginProxies() {
  return "PROXY_PREFIXES" in constants &&
    Array.isArray(constants.PROXY_PREFIXES)
    ? constants.PROXY_PREFIXES
    : [constants.PROXY_PREFIX];
}
