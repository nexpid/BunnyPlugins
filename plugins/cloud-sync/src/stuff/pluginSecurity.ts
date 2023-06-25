import { PROXY_PREFIX } from "@vendetta/constants";
import { id } from "@vendetta/plugin";

export function isPluginProxied(id: string): boolean {
  return id.startsWith(PROXY_PREFIX);
}
export function isSelfProxied(): boolean {
  return id.startsWith(PROXY_PREFIX);
}
export function canLoadPlugin(id: string): boolean {
  if (isSelfProxied()) return isPluginProxied(id);
  else return true;
}
