import { findByName } from "@vendetta/metro";
import { i18n, ReactNative as RN } from "@vendetta/metro/common";

import { fluxSubscribe } from "$/types";
import RNFS from "$/wrappers/RNFS";

import type { LangValues } from "../../lang/defs";
import { useLangStore } from "./LangStore";

// from Pyoncord
const IntlMessageFormat = findByName("MessageFormat");

RNFS.exists(`${RNFS.DocumentDirectoryPath}/vendetta/NexpidLang`).then(
  (yes) =>
    yes && RNFS.unlink(`${RNFS.DocumentDirectoryPath}/vendetta/NexpidLang`),
);

export class Lang<Plugin extends keyof LangValues> {
  private _unload: () => void;

  public Values: LangValues[Plugin]["values"];

  constructor(public plugin: Plugin) {
    useLangStore.persist.setOptions({
      name: `nexpid-lang-${plugin}`,
      onRehydrateStorage: () => (state) => state.update(this.plugin),
    });
    useLangStore.persist.rehydrate();

    this._unload = fluxSubscribe("I18N_LOAD_SUCCESS", () =>
      useLangStore.persist.rehydrate(),
    );
  }

  unload() {
    this._unload?.();
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

  format<Key extends keyof LangValues[Plugin]["values"]>(
    _key: Key,
    input: Key extends keyof LangValues[Plugin]["fillers"]
      ? LangValues[Plugin]["fillers"][Key]
      : Record<string, never>,
  ): string {
    const key = _key as string;
    const locale = Lang.getLang();

    const values = useLangStore.getState().values;
    if (!values) return String(key);

    const val =
      values[locale]?.[key] ?? values.en?.[key] ?? DEFAULT_LANG?.[key];
    if (!val) return String(key);

    if (Object.keys(input).length > 0)
      return new IntlMessageFormat(val).format(input);
    else return val;
  }
}
