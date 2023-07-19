import { fetchPlugin, startPlugin, stopPlugin } from "@vendetta/plugins";
import patcher from "./stuff/patcher";
import { findByProps, findByStoreName } from "@vendetta/metro";
import { storage } from "@vendetta/plugin";

const UserStore = findByStoreName("UserStore");
const { showUserProfile } = findByProps("showUserProfile");
const { fetchProfile } = findByProps("fetchProfile");

export async function refetchPlugin(plugin: any) {
  const enab = plugin.enabled;
  for (let i = 0; i < 2; i++) {
    if (enab) stopPlugin(plugin.id, false);
    await fetchPlugin(plugin.id);
    if (enab) await startPlugin(plugin.id);
  }
}

export async function openProfile(id: string) {
  if (!UserStore.getUser(id)) await fetchProfile(id);
  showUserProfile({ userId: id });
}

export const pluginsURL =
  "https://vd-plugins.github.io/proxy/plugins-full.json";

const linkMatches = {
  multiplePluginGitio: /^(.*?)(?=\.)\.github\.io\/(.*?)(?=\/)\/(.*)/,
  singlePluginGitio: /^(.*?)(?=\.)\.github\.io\/(.*)/,
  githubReleases: /^github\.com\/(.*?)(?=\/)\/(.*?)(?=\/)\/releases/, // i think only rosie does it this way (good for you rosie)
};
export function matchGithubLink(link: string): string | undefined {
  const multi = link.match(linkMatches.multiplePluginGitio);
  if (multi?.[0])
    return `https://github.com/${multi[1]}/${multi[2]}/tree/master/plugins/${multi[3]}`;

  const single =
    link.match(linkMatches.singlePluginGitio) ??
    link.match(linkMatches.githubReleases);
  if (single?.[0]) return `https://github.com/${multi[1]}/${multi[2]}`;
}

export const vstorage: {
  pluginCache?: string[];
} = storage;

let unpatch;
export default {
  onLoad: () => (unpatch = patcher()),
  onUnload: () => unpatch?.(),
};
