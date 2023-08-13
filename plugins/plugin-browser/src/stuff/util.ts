import {
  fetchPlugin,
  plugins,
  startPlugin,
  stopPlugin,
} from "@vendetta/plugins";
import { themes } from "@vendetta/themes";

export function properLink(id: string): string {
  return !id.endsWith("/") ? id + "/" : id;
}

const linkMatches = {
  origin: /^([^/]+)\/(.*)/,
  multiplePluginGitio: /^(.*?)(?=\.)\.github\.io\/(.*?)(?=\/)\/(.*)/,
  singlePluginGitio: /^(.*?)(?=\.)\.github\.io\/(.*)/,
  githubReleases: /^github\.com\/(.*?)(?=\/)\/(.*?)(?=\/)\/releases/,
};

// will update sometimes for other plugin devs
const customLinks = {
  "vendetta.nexpid.xyz": (path: string[]) =>
    `https://github.com/Gabe616/VendettaPlugins/tree/master/plugins/${path.join(
      "/"
    )}`,
  "vendetta.sdh.gay": (path: string[]) =>
    `https://github.com/sdhhhhh/vd-repo/tree/master/plugins/${path.join("/")}`,
  "plugins.obamabot.me": (path: string[]) =>
    `https://github.com/WolfPlugs/${path[0]}/tree/master/${path
      .slice(1)
      .join("/")}`,
  "mugman.catvibers.me": (path: string[]) =>
    `https://github.com/mugman174/${path[0]}/tree/master/plugins/${path
      .slice(1)
      .join("/")}`,
};

export function matchGithubLink(link: string): string | undefined {
  const multi = link.match(linkMatches.multiplePluginGitio);
  if (multi?.[0])
    return `https://github.com/${multi[1]}/${multi[2]}/tree/master/plugins/${multi[3]}`;

  const single =
    link.match(linkMatches.singlePluginGitio) ??
    link.match(linkMatches.githubReleases);
  if (single?.[0]) return `https://github.com/${single[1]}/${single[2]}`;

  const [_, origin, path] = link.match(linkMatches.origin);
  if (customLinks[origin]) return customLinks[origin](path.split("/"));
}

export async function refetchPlugin(plugin: any) {
  const enab = plugin.enabled;
  for (let i = 0; i < 2; i++) {
    if (enab) stopPlugin(plugin.id, false);
    await fetchPlugin(plugin.id);
    if (enab) await startPlugin(plugin.id);
  }
}

export const emitterSymbol = Symbol.for("vendetta.storage.emitter");
export const emitterAvailable =
  !!(plugins as any)[emitterSymbol] && !!(themes as any)[emitterSymbol];
