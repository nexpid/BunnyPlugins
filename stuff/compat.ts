// temporary compability for various Vendetta forks

import { constants } from "@vendetta";

export function getClient() {
  const gh = constants.GITHUB;

  if (gh.includes("vendetta-mod")) return "Vendetta";
  else if (gh.includes("revenge-mod")) return "Revenge";
  else if (gh.includes("pyoncord")) return "Bunny";
  else return "Unknown Client";
}

export function pluginProxies() {
  return "PROXY_PREFIXES" in constants &&
    Array.isArray(constants.PROXY_PREFIXES)
    ? constants.PROXY_PREFIXES
    : [constants.PROXY_PREFIX];
}
