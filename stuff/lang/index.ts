import { i18n } from "@vendetta/metro/common";

import constants from "$/constants";
import RNFS from "$/wrappers/RNFS";

import type { LangValues } from "../../lang/defs";

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

  public Values: LangValues[Plugin]["values"];

  constructor(public plugin: Plugin) {
    this.load();
  }

  static getLang(): string {
    const lang = i18n.getLocale()?.replace(/-/g, "_") ?? "en";

    if (lang.startsWith("en_")) return "en";
    else return lang;
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

  unload() {
    this.controller.abort();
  }

  format<Key extends keyof LangValues[Plugin]["values"]>(
    _key: Key,
    fillers: Key extends keyof LangValues[Plugin]["fillers"]
      ? //@ts-expect-error shut up shut up shut up shut up
        Record<LangValues[Plugin]["fillers"][Key][number], string | number>
      : Record<string, never>,
    /** @deprecated This gets filled in by the builder, do not use!!!! */
    _def?: never,
  ): string {
    const def = _def as string;
    const key = _key as string;

    if (!this.values) return String(key);

    let val =
      this.values[Lang.getLang()]?.[key] ?? this.values.en?.[key] ?? def;
    if (!val) return String(key);

    const reqs = val.match(/\$\w+/g)?.map((x) => x.slice(1)) ?? [];
    for (const r of reqs)
      val = val.replace(
        new RegExp(`\\$${r}`, "g"),
        String(r in fillers ? fillers[r] : ""),
      );

    return val;
  }
}
