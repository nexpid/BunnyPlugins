export function parseRelative(
  things: { time: boolean; date: boolean },
  backticks: { time: boolean; date: boolean },
  content: string,
  replacer: (str: string, time: number) => string
) {
  const timeThingies = [
    ["seconds?", 1000],
    ["minutes?", 1000 * 60],
    ["hours?", 1000 * 60 * 60],
  ];

  const year = 365 + 1 / 4;
  const dateThingies = [
    ["days?", 1],
    ["weeks?", 7],
    ["months?", 30.436875],
    ["years?", year],
    ["decades?", year * 10],
    ["century", year * 100],
    ["centuries", year * 100],
  ].map((x) => [x[0], (x[1] as number) * 1000 * 60 * 60 * 24]);

  const combinedThingies = [
    ...(things.time ? timeThingies : []),
    ...(things.date ? dateThingies : []),
  ].filter((x) => !!x) as [string, number][];

  const j = (x: boolean) =>
    x ? ["`", "`"] : ["(?:\\s|\\t|^)", "(?:\\s|\\t|$)"];
  const jTime = j(backticks.time);
  const jDate = j(backticks.date);

  const formatIn = (x: string) => `in (an?|[0-9]+) (${x})`;
  const formatAgo = (x: string) => `(an?|[0-9]+) (${x}) ago`;

  const match = [
    things.time && [
      1,
      `${jTime[0]}${formatIn(timeThingies.map((x) => x[0]).join("|"))}${
        jTime[1]
      }`,
    ],
    things.time && [
      -1,
      `${jTime[0]}${formatAgo(timeThingies.map((x) => x[0]).join("|"))}${
        jTime[1]
      }`,
    ],

    things.date && [
      1,
      `${jDate[0]}${formatIn(dateThingies.map((x) => x[0]).join("|"))}${
        jDate[1]
      }`,
    ],
    things.date && [
      -1,
      `${jDate[0]}${formatAgo(dateThingies.map((x) => x[0]).join("|"))}${
        jDate[1]
      }`,
    ],
  ].filter((x) => !!x) as [number, string][];

  for (const [mult, reg] of match) {
    content = content.replace(new RegExp(reg, "gi"), (str, time, thing) => {
      const dr = time.toLowerCase().startsWith("a") ? 1 : Number(time);
      if (Number.isNaN(dr)) return str;

      const calc = combinedThingies.find((x) =>
        x[0].toLowerCase().includes(thing)
      )?.[1];
      if (!calc) return str;

      return replacer(str, calc * dr * mult);
    });
  }

  const specialDate = [
    ["last week", -7],
    ["yesterday", -1],
    ["tomorrow", 1],
    ["next week", 7],
  ].map((x) => [
    `${jDate[0]}${x[0]}${jDate[1]}`,
    (x[1] as number) * 1000 * 60 * 60 * 24,
  ]);
  const combinedSpecial = [...(things.date ? specialDate : [])].filter(
    (x) => !!x
  ) as [string, number][];

  for (const [reg, diff] of combinedSpecial)
    content = content.replace(new RegExp(reg, "gi"), (str) =>
      replacer(str, diff)
    );

  return content;
}
