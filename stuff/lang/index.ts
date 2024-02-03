import { i18n } from "@vendetta/metro/common";

import type { LangValues } from "../../lang/defs";

export class Lang<Plugin extends keyof LangValues> {
  private values: Record<string, Record<string, string>> | null = null;
  private controller = new AbortController();

  public Values: LangValues[Plugin]["values"];

  constructor(public plugin: Plugin) {
    this.load();
  }

  static getLang(): string {
    //REVIEW - can this even be undefined? who knows
    const lang = i18n.getLocale()?.replace(/-/g, "_") ?? "en";

    if (lang.startsWith("en_")) return "en";
    else return lang;
  }

  private async load() {
    if (DEV_LANG) this.values = DEV_LANG;
  }

  unload() {
    this.controller.abort();
  }

  format<Key extends keyof LangValues[Plugin]["values"]>(
    key: Key,
    fillers: Key extends keyof LangValues[Plugin]["fillers"]
      ? //@ts-expect-error shut up shut up shut up shut up
        Record<LangValues[Plugin]["fillers"][Key][number], string | number>
      : Record<string, never>,
  ): string {
    if (!this.values) return String(key);

    const lang = this.values[Lang.getLang()];
    if (!lang) return String(key);

    let val = lang[String(key)];
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
