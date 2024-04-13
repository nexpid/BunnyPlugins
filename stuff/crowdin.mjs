// used both in scripts and in plugins

/** @type {RegExp[]} */
const variableRules = [
  // You have {plugins} {plugins, plural, one {plugin} other {plugins}}!
  // Good {time, select, isDay {day} isNight {night} other {}}!
  /{([^}]+), (select|plural), ?\n?([\s\S]+?)(?=(}})|(} ?\r?\n ?}))/g,
  // Hello world from {plugin.name}!
  /{([^}]+)}/g,
];
const replacerRegExp = /(\w+) {([^}]*)} ?/g;

/**
 * Parses the variable rules from the given text
 * @param {string} text
 */
export function parseVariableRules(text) {
  /** @type {({ variable: string, start: number, length: number } & ({ type: "variable" } | { type: "choose", kind: "select" | "plural", replacers: Record<string, string> }))[]} */
  const rules = [];

  for (const regex of variableRules) {
    const matches = text.matchAll(regex);
    for (const rawMatch of Array.from(matches)) {
      const [match, variable, kind, rawReplacers, _suffix1, _suffix2] =
        rawMatch;
      const { index } = rawMatch;

      const suffix = _suffix1 ?? _suffix2 ?? "";

      // ignore previously matched things
      if (rules.some((x) => index >= x.start && index < x.start + x.length))
        continue;

      if (!kind) {
        rules.push({
          type: "variable",
          variable,
          start: index,
          length: match.length + suffix.length,
        });
      } else {
        // map replacers insto a [key, value] array
        const replacers = Object.fromEntries(
          Array.from((rawReplacers + "}").matchAll(replacerRegExp)).map((x) => [
            x[1],
            x[2],
          ]),
        );
        rules.push({
          type: "choose",
          kind: kind,
          variable,
          start: index,
          length: match.length + suffix.length,
          replacers,
        });
      }
    }
  }

  return rules;
}

/**
 * Replaces the variable rules in the given text with the specified input.
 * @param {string} text
 * @param {any[]} rules
 * @param {Record<string, any>} input
 * @param {(num: number) => string} [pluralRuleFunction]
 */
export function replaceVariableRules(text, rules, input, pluralRuleFunction) {
  const chars = text.split("");

  let offset = 0;
  for (const rule of rules.sort((a, b) => a.start - b.start)) {
    let replace = input[String(rule.variable)] ?? "";
    if (rule.type === "choose") {
      if (rule.kind === "select")
        replace = rule.replacers[replace] ?? rule.replacers.other ?? "";
      else if (rule.kind === "plural") {
        const num = Number(replace);

        let target = "other";
        if (pluralRuleFunction && !Number.isNaN(num)) {
          const newTarget = pluralRuleFunction(num);
          if (newTarget in rule.replacers) target = newTarget;
        } else if (!Number.isNaN(num)) {
          if (num === 0 && "zero" in rule.replacers) target = "zero";
          else if (num === 1 && "one" in rule.replacers) target = "one";
        }

        replace = (rule.replacers[target] ?? "").replaceAll("#", replace);
      }
    }

    chars.splice(rule.start + offset, rule.length, replace ?? "");
    offset -= rule.length - 1;
  }

  return chars.join("");
}
