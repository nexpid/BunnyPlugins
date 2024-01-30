// copied from https://github.com/Vendicated/Vencord/blob/main/src/plugins/clearURLs/defaultRules.ts
//

import { Joi } from "$/deps";
import RNFS from "$/wrappers/RNFS";

import rawList from "../../assets/list.json";
import { listUrl } from "..";

const make = () =>
  RNFS.hasRNFS && RNFS.mkdir(`${RNFS.DocumentDirectoryPath}/CleanURLs`);
const filePath = () => `${RNFS.DocumentDirectoryPath}/CleanURLs/list.json`;
const etagPath = () => `${RNFS.DocumentDirectoryPath}/CleanURLs/list_etag.txt`;

const Rules = Joi.object({
  main: [Joi.string()],
  extended: [Joi.string()],
});

interface ParsedRules {
  universal: RegExp[];
  byHost: Record<string, RegExp[]>;
  hostMap: Record<string, RegExp>;
}
let cachedRules: ParsedRules;
const parseRules = (rules: {
  main: string[];
  extended: string[];
}): ParsedRules | undefined => {
  if (Rules.validate(rules).error) throw new Error(":(");

  const reEscaper = /[\\^$.*+?()[\]{}|]/g;
  const reEscape = (str: string) => str.replace(reEscaper, "\\$&");

  const universal = new Array<RegExp>();
  const byHost: Record<string, RegExp[]> = {};
  const hostMap: Record<string, RegExp> = {};

  for (const mrule of [...rules.main, ...rules.extended]) {
    const [rule, host] = mrule.split("@");
    const reRule = new RegExp(`^${reEscape(rule).replace(/\*/g, ".+?")}$`);

    if (!host) {
      universal.push(reRule);
      continue;
    }

    const reHost = new RegExp(
      `^(?:www\\.)?${reEscape(host)
        .replace(/\*\./g, "(?:.+?\\.)?")
        .replace(/\*/g, ".+?")}$`,
    );
    const reHostStr = reHost.toString();

    hostMap[reHostStr] = reHost;
    byHost[reHostStr] ??= [];
    byHost[reHostStr].push(reRule);
  }

  return { universal, byHost, hostMap };
};

const fetchRules = async () => {
  if (IS_DEV) {
    cachedRules = parseRules(rawList);
  } else {
    make();
    const lastEtag =
      (await RNFS.exists(etagPath())) && (await RNFS.readFile(etagPath()));
    const res = await fetch(listUrl, {
      headers: {
        "cache-control": "public; max-age=20",
      },
    });
    if (!res.ok) return;

    const newEtag = res.headers.get("etag");
    if (!newEtag) return;

    if (newEtag !== lastEtag) {
      RNFS.writeFile(etagPath(), newEtag);

      const txt = await res.text();
      RNFS.writeFile(filePath(), txt);
      try {
        cachedRules = parseRules(JSON.parse(txt));
      } catch {
        // continue
      }
    }
  }
};

export function getRules(): ParsedRules {
  fetchRules();
  return cachedRules ?? { universal: [], byHost: {}, hostMap: {} };
}
