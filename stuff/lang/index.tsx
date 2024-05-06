import { findByName } from "@vendetta/metro";
import { i18n, ReactNative as RN } from "@vendetta/metro/common";

import constants from "$/constants";
import RNFS from "$/wrappers/RNFS";

import type { LangValues } from "../../lang/defs";
import { parseVariableRules } from "../crowdin.mjs";

// from Pyoncord
const IntlMessageFormat = findByName("MessageFormat");

const make = () =>
  RNFS.hasRNFS &&
  RNFS.mkdir(`${RNFS.DocumentDirectoryPath}/vendetta/NexpidLang`);
const filePath = (plugin: string) =>
  `${RNFS.DocumentDirectoryPath}/vendetta/NexpidLang/${plugin}.json`;
const etagPath = (plugin: string) =>
  `${RNFS.DocumentDirectoryPath}/vendetta/NexpidLang/${plugin}_etag.txt`;

export class Lang<Plugin extends keyof LangValues> {
  private values: Record<string, Record<string, string>> | null = null;
  private controller = new AbortController();
  private variableRules: Record<string, any> = {};

  public Values: LangValues[Plugin]["values"];

  constructor(public plugin: Plugin) {
    this.load();
  }

  static getLang(): string {
    const lang = i18n.getLocale()?.replace(/-/g, "_") ?? "en";

    if (lang.startsWith("en_")) return "en";
    else return lang;
  }

  static basicFormat(text: string): React.ReactNode {
    const rules = [
      {
        regex: /\*\*(.*?)\*\*/g,
        react: (txt: string) => (
          <RN.Text style={{ fontWeight: "900" }}>{txt}</RN.Text>
        ),
      },
    ];

    const txt = text.split("") as (string | React.ReactNode)[];
    let off = 0;
    for (const rule of rules) {
      const matches = Array.from(text.matchAll(rule.regex));
      for (const match of matches)
        if (match[1]) {
          txt.splice(match.index + off, match[0].length, rule.react(match[1]));
          off -= match[0].length + 1;
        }
    }

    return txt;
  }

  private async load() {
    const read = async () => {
      if (await RNFS.exists(filePath(this.plugin)))
        try {
          this.values = JSON.parse(await RNFS.readFile(filePath(this.plugin)));
        } catch {
          return;
        }
    };

    if (DEV_LANG) this.values = DEV_LANG;
    else {
      const res = await fetch(
        `${constants.github.raw}lang/values/${this.plugin}.json`,
        {
          headers: {
            "cache-control": "public, max-age=20",
          },
        },
      );
      if (!res.ok) return read();

      make();
      const lastEtag =
        (await RNFS.exists(etagPath(this.plugin))) &&
        (await RNFS.readFile(etagPath(this.plugin)));

      const newEtag = res.headers.get("etag");
      if (!newEtag) return read();

      if (newEtag !== lastEtag) {
        RNFS.writeFile(etagPath(this.plugin), newEtag);

        const txt = await res.text();
        RNFS.writeFile(filePath(this.plugin), txt);

        try {
          this.values = JSON.parse(txt);
        } catch {
          return;
        }
      } else read();
    }
  }

  private makeVariableRules(text: string) {
    const rules = parseVariableRules(text);

    this.variableRules = rules;
    return rules;
  }

  unload() {
    this.controller.abort();
  }

  format<Key extends keyof LangValues[Plugin]["values"]>(
    _key: Key,
    input: Key extends keyof LangValues[Plugin]["fillers"]
      ? LangValues[Plugin]["fillers"][Key]
      : Record<string, never>,
  ): string {
    const key = _key as string;
    const locale = Lang.getLang();

    if (!this.values) return String(key);

    const val =
      this.values[locale]?.[key] ??
      this.values.en?.[key] ??
      DEFAULT_LANG?.[key];
    if (!val) return String(key);

    const rules = this.variableRules[val] ?? this.makeVariableRules(val);
    if (rules.length > 0) return new IntlMessageFormat(val).format(input);
    else return val;
  }
}
