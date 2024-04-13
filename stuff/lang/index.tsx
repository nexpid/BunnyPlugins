import { findByProps } from "@vendetta/metro";
import { i18n } from "@vendetta/metro/common";

import Text from "$/components/Text";
import constants from "$/constants";
import { TextStyleSheetHasCase } from "$/types";
import RNFS from "$/wrappers/RNFS";

import type { LangValues } from "../../lang/defs";
import { parseVariableRules, replaceVariableRules } from "../crowdin.mjs";

const intl = findByProps("defaultLocale", "prototype");

const url = `${constants.github.raw}lang/values/`;

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

  static basicFormat(
    text: string,
    textVariant = "text-md" as TextStyleSheetHasCase,
    color = "TEXT_NORMAL",
  ): React.ReactNode {
    const rules = [
      {
        regex: /\*\*(.*?)\*\*/g,
        react: (txt: string) => (
          <Text variant={`${textVariant}/bold`} color={color}>
            {txt}
          </Text>
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
      const res = await fetch(`${url}${this.plugin}.json`, {
        headers: {
          "cache-control": "public, max-age=20",
        },
      });
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
    /** @deprecated This gets filled in by the builder, do not use!!!! */
    _defaultValue?: never,
  ): string {
    // comments provided by Rosie :)

    const defaultValue = _defaultValue as string;
    const key = _key as string;
    const locale = Lang.getLang();

    if (!this.values) return String(key);

    const val =
      this.values[locale]?.[key] ?? this.values.en?.[key] ?? defaultValue;
    if (!val) return String(key);

    const rules = this.variableRules[val] ?? this.makeVariableRules(val);
    if (rules.length > 0)
      return replaceVariableRules(
        val,
        rules,
        input,
        intl.prototype._findPluralRuleFunction(locale),
      );
    else return val;
  }
}
