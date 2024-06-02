import { existsSync } from "fs";
import { readdir, readFile, writeFile } from "fs/promises";
import { format } from "prettier";

console.time("Done");

const pluginBase = "bunny.nexpid.xyz/";

const invalidPlugins = [];
const plugins = [];
const links = {
  // STUB vendetta.nexpid.xyz => bunny.nexpid.xyz
  proxied: `https://bn-plugins.github.io/vd-proxy/vendetta.nexpid.xyz/`,
  code: `https://github.com/nexpid/BunnyPlugins/tree/main/plugins/`,
  external: {
    backend: "https://github.com/nexpid/",
  },
};

const mdNote = `<!--
  * This file was autogenerated
  * If you want to change anything, do so in the readmes.mjs script
  * https://github.com/nexpid/BunnyPlugins/edit/main/scripts/readmes.mjs
-->\n`;

/*
  colors are from catppuccin
*/
const statusColors = {
  unfinished: "#9399b2",
  finished: "#a6e3a1",
  discontinued: "#f38ba8",
};
const shieldLabelColor = "#1e1e2e".slice(1);
const shieldColors = {
  ghstars: "#b4befe".slice(1),
  ghissues: "#74c7ec".slice(1),
  ghpullreqs: "#a6e3a1".slice(1),
  discord: "#eba0ac".slice(1),

  proxiedlink: "#11111b".slice(1),
  unproxiedlink: "#1e1e2e".slice(1),
  externallink: "#45475a".slice(1),
  codelink: "#313244".slice(1),
};
const shieldLogos = {
  ghstars: "starship&logoColor=fff",
  ghissues: "gitbook&logoColor=fff",
  ghpullreqs: "saucelabs&logoColor=fff",
  discord: "discord&logoColor=fff",
};

const categories = [
  ["✅ Finished", "finished"],
  ["❌ Unfinished", "unfinished"],
  ["🎫 Discontinued", "discontinued"],
];

const makeBadge = (label, text, textColor, labelColor = shieldLabelColor) =>
  `<img alt="${label}" src="https://img.shields.io/badge/${label}${
    text ? `-${text}` : ""
  }${textColor && text ? `-${textColor}` : ""}${
    !text ? `-${labelColor}` : ""
  }?style=for-the-badge${text ? `&labelColor=${labelColor}` : ""}" />`;
const makeHref = (href, text, spacing = 0) => `<a href="${href}">
${"  ".repeat(spacing + 1)}${text}
${"  ".repeat(spacing)}</a>`;
const makeHrefBadge = (href, label, text, textColor, labelColor, spacing = 0) =>
  makeHref(href, makeBadge(label, text, textColor, labelColor), spacing);

const makeMDHrefBadge = (href, label, text, textColor, labelColor) =>
  `[${makeBadge(label, text, textColor, labelColor)}](${href})`;

for (const x of await readdir("plugins")) {
  const path = `plugins/${x}/`;
  if (!existsSync(`${path}manifest.json`)) {
    console.log(`Could not find ${path}manifest.json`);
    invalidPlugins.push(x);
    continue;
  }
  if (!existsSync(`${path}status.json`)) {
    console.log(`Could not find ${path}status.json`);
    invalidPlugins.push(x);
    continue;
  }

  try {
    const manifest = JSON.parse(await readFile(`${path}manifest.json`, "utf8"));
    const { status, proxied, usable, discontinuedFor, external } = JSON.parse(
      await readFile(`${path}status.json`, "utf8"),
    );

    const plugin = {
      id: x,
      name: manifest.name,
      description: manifest.description,
      status,
      proxied,
      discontinuedFor,
      links: {
        copy: [
          proxied && {
            title: "copy_proxied_link",
            link: `${links.proxied}${x}`,
            color: shieldColors.proxiedlink,
          },
          (status === "finished" || usable) && {
            title: "copy_link",
            link: `https://${pluginBase}${x}`,
            color: shieldColors.unproxiedlink,
          },
        ],
        external: [
          external?.backend && {
            title: "view_backend_code",
            link: `${links.external.backend}${external.backend}`,
            color: shieldColors.externallink,
          },
        ].filter((x) => !!x),
        code: {
          title: "view_code",
          link: `${links.code}${x}`,
          color: shieldColors.codelink,
        },
      },
    };
    plugins.push(plugin);

    const badges = {
      copy:
        plugin.links.copy[0] &&
        plugin.links.copy
          .map((x) =>
            makeHrefBadge(x.link, x.title, undefined, undefined, x.color, 1),
          )
          .join("\n"),
      external:
        plugin.links.external[0] &&
        plugin.links.external
          .map((x) =>
            makeHrefBadge(x.link, x.title, undefined, undefined, x.color, 1),
          )
          .join("\n"),
    };

    const preadme = `${mdNote}

<div align="center">
  ${makeBadge(
    "plugin_status",
    plugin.status,
    statusColors[plugin.status].slice(1),
  )}${badges.copy || badges.external ? `\n  <br/>` : ""}${
    badges.copy ? "\n  " : ""
  }${badges.copy ?? ""}${badges.external ? "\n  " : ""}${badges.external ?? ""}
</div>
<br/>
<div align="center">
  <h1>${plugin.name}</h1>
</div>

${plugin.description}`;

    await writeFile(
      `${path}README.md`,
      await format(preadme, { parser: "markdown" }),
    );
    console.log(`Wrote ${path}README.md`);
  } catch (e) {
    console.log(`Failed to parse ${path}!`, e);
    invalidPlugins.push([x, e?.message ?? `${e}`]);
  }
}

const stats = {
  all: plugins.length,
  finished: plugins.filter((x) => x.status === "finished").length,
  unproxied: plugins.filter((x) => x.status === "finished" && !x.proxied)
    .length,
  unfinished: plugins.filter((x) => x.status === "unfinished").length,
  discontinued: plugins.filter((x) => x.status === "discontinued").length,
};

const plur = (x, p = "s", s = "") => (x !== 1 ? p : s);

const chart = {
  type: "doughnut",
  data: {
    labels: [
      stats.finished > 0 && "Finished",
      stats.unfinished > 0 && "Unfinished",
      stats.discontinued > 0 && "Discontinued",
    ].filter((x) => !!x),
    datasets: [
      {
        data: [stats.finished, stats.unfinished, stats.discontinued].filter(
          (x) => x > 0,
        ),
        backgroundColor: [
          stats.finished > 0 && statusColors.finished,
          stats.unfinished > 0 && statusColors.unfinished,
          stats.discontinued > 0 && statusColors.discontinued,
        ].filter((x) => !!x),
        datalabels: {
          labels: {
            index: {
              color: "#FFF",
              font: {
                size: 18,
              },
              align: "end",
              anchor: "end",
              formatter: (_, ctx) => ctx.chart.data.labels[ctx.dataIndex],
            },
            name: {
              color: "#222",
              backgroundColor: "#FFF",
              borderRadius: 4,
              offset: 0,
              padding: 2,
              font: {
                size: 16,
              },
              align: "top",
              formatter: (val) => `${Math.floor((val / stats.all) * 100)}%`,
            },
            value: {
              color: "#FFF",
              font: {
                size: 16,
              },
              padding: 0,
              align: "bottom",
            },
          },
        },
      },
    ],
  },
  options: {
    legend: {
      display: false,
    },
    layout: {
      padding: {
        top: 30,
        bottom: 30,
      },
    },
    plugins: {
      datalabels: {
        display: true,
      },
      doughnutlabel: {
        color: "#FFF",
        labels: [
          {
            text: stats.all,
            font: {
              size: 20,
              weight: "bold",
            },
          },
          {
            text: "plugins",
          },
        ],
      },
    },
  },
};

const stuff = {};
const iterateThing = (x) => {
  for (const [y, z] of Object.entries(x)) {
    if (typeof z === "function") {
      const id = new Array(50)
        .fill()
        .map(() => Math.floor(Math.random() * 10))
        .join("");

      stuff[id] = z.toString().replaceAll("stats.all", stats.all);
      x[y] = id;
    } else if (typeof z === "object") {
      if (!Array.isArray(z)) iterateThing(z);
      else
        for (const a of z)
          if (typeof a === "object" && !Array.isArray(a)) iterateThing(a);
    }
  }
};
iterateThing(chart);

let stringifiedChart = JSON.stringify(chart);
for (const [x, y] of Object.entries(stuff))
  stringifiedChart = stringifiedChart.replace(`"${x}"`, y);

const plist = categories
  .map((x) => [x[0], plugins.filter((y) => y.status === x[1])])
  .map(
    ([status, plugins]) =>
      `### ${status}\n\n${plugins
        .map(
          (y) =>
            `- ${y.name} — ${y.description}${
              y.discontinuedFor
                ? `\n  - **Discontinued For:** ${y.discontinuedFor}`
                : ""
            }\n  - ${[...y.links.copy, y.links.code, ...y.links.external]
              .filter((z) => !!z)
              .map((z) => makeMDHrefBadge(z.link, z.title, z.color))
              .join(" ")}`,
        )
        .join("\n")}`,
  );

const mreadme = `${mdNote}

<div align="center">
  ${makeHref(
    "https://github.com/nexpid/BunnyPlugins/stargazers",
    `<img alt="GitHub stars" src="https://img.shields.io/github/stars/nexpid/BunnyPlugins?style=for-the-badge&color=${shieldColors.ghstars}&labelColor=${shieldLabelColor}&logo=${shieldLogos.ghstars}">`,
    1,
  )}
  ${makeHref(
    "https://github.com/nexpid/BunnyPlugins/issues",
    `<img alt="GitHub issues" src="https://img.shields.io/github/issues/nexpid/BunnyPlugins?style=for-the-badge&color=${shieldColors.ghissues}&labelColor=${shieldLabelColor}&logo=${shieldLogos.ghissues}">`,
    1,
  )}
  ${makeHref(
    "https://github.com/nexpid/BunnyPlugins/pulls",
    `<img alt="GitHub pull requests" src="https://img.shields.io/github/issues-pr/nexpid/BunnyPlugins?style=for-the-badge&color=${shieldColors.ghpullreqs}&labelColor=${shieldLabelColor}&logo=${shieldLogos.ghpullreqs}">`,
    1,
  )}
  ${makeHref(
    "https://discord.gg/ddcQf3s2Uq",
    `<img alt="Discord members" src="https://img.shields.io/discord/1196075698301968455?style=for-the-badge&color=${shieldColors.discord}&labelColor=${shieldLabelColor}&logo=${shieldLogos.discord}">`,
    1,
  )}
</div>
<br/>
<div align="center">
  <h1>🐇 Bunny Plugins</h1>
</div>

A collection of all my awesome plugins for [Bunny](https://github.com/pyoncord/Bunny#installing).  
My plugins assume you're using version atleast **211.10** (211210) from **January 1st**, they might not work properly if you use an older version than that.

## 🌐 Localization

<a href="https://crowdin.com/project/nexpid-vendetta-plugins">
  <img src=".github/localization.png" alt="Help me by translating my plugins into your language on Crowdin!" />
</a>

## 📊 Stats

I've coded a total of **${stats.all}** plugin${plur(stats.all)}.  
Out of the plugins I've coded, **${stats.finished}** ${plur(
  stats.finished,
  "are finished",
  "is finished",
)}. I'm working on **${stats.unfinished}** plugin${plur(stats.unfinished)}, and **${
  stats.discontinued
}** plugin${plur(stats.discontinued, "s are", " is")} discontinued.

<div align="center">
  <img alt="Stats Pie Chart" src="https://quickchart.io/chart?c=${encodeURIComponent(
    stringifiedChart,
  )}" width=600 />
</div>

## 📃 Plugin List

${plist.join("\n\n")}${
  invalidPlugins.length > 0
    ? `

> **Note**  
> **${invalidPlugins.length}** plugin${plur(
        invalidPlugins.length,
        "s aren't",
        " isn't",
      )} being shown due to being formatted incorrectly:  
${invalidPlugins.map((x) => `> - ${x}  `).join("\n")}`
    : ""
}

## 📜 Licensing

<details>
  <summary>This project now uses the CC-BY-4.0 license</summary>

  The Creative Commons Attribution 4.0 International License is an open and flexible license that grants users the ability to share, adapt, and build upon the contents of this project for any purpose, including commercial endeavors. Under this license, users are required to provide appropriate attribution to the original author(s), acknowledging their contribution to the work. This license promotes collaboration and innovation by allowing individuals and organizations to leverage and modify the project while ensuring that credit is given to the creators.
</details>\n`;

await writeFile("README.md", await format(mreadme, { parser: "markdown" }));
console.log("Wrote README.md");

console.log("");
console.timeEnd("Done");
