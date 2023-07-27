import { existsSync } from "fs";
import { readFile, writeFile, readdir, unlink } from "fs/promises";
import { parse } from "smol-toml";

console.time("Done");

const invalidPlugins = [];
const plugins = [];
const links = {
  proxied:
    "https://vd-plugins.github.io/proxy/gabe616.github.io/VendettaPlugins/",
  unproxied: "https://gabe616.github.io/VendettaPlugins/",
  code: `https://github.com/Gabe616/VendettaPlugins/tree/main/plugins/`,
  external: {
    backend: "https://github.com/Gabe616/",
  },
};

/*
colors are from catppuccin
*/
const statusColors = {
  unfinished: "#9399b2",
  finished: "#a6e3a1",
  proxied: "#89dceb",
  discontinued: "#f38ba8",
};
const shieldLabelColor = "#1e1e2e".slice(1);
const shieldColors = {
  ghstars: "#b4befe".slice(1),
  ghissues: "#74c7ec".slice(1),
  ghpullreqs: "#a6e3a1".slice(1),
  discord: "#eba0ac".slice(1),
};
const shieldLogos = {
  ghstars: "starship&logoColor=fff",
  ghissues: "gitbook&logoColor=fff",
  ghpullreqs: "saucelabs&logoColor=fff",
  discord: "discord&logoColor=fff",
};

const categories = [
  ["✅ Finished", ["proxied", "finished"]],
  ["❌ Unfinished", ["unfinished"]],
  ["🎫 Discontinued", ["discontinued"]],
];

const makeBadge = (label, text, textColor) =>
  `<img alt="${label}" src="https://img.shields.io/badge/${label}${
    text ? `-${text}` : ""
  }${textColor && text ? `-${textColor}` : ""}${
    !text ? `-${shieldLabelColor}` : ""
  }?style=for-the-badge${text ? `&labelColor=${shieldLabelColor}` : ""}" />`;
const makeHref = (href, text, spacing = 0) => `<a href="${href}">
${"\t".repeat(spacing + 1)}${text}
${"\t".repeat(spacing)}</a>`;
const makeHrefBadge = (href, label, text, textColor, spacing = 0) =>
  makeHref(href, makeBadge(label, text, textColor), spacing);

const makeMDHrefBadge = (href, label, text, textColor) =>
  `[${makeBadge(label, text, textColor)}](${href})`;

for (const x of await readdir("./plugins")) {
  const path = `./plugins/${x}/`;
  if (!existsSync(`${path}manifest.json`)) {
    console.log(`Could not find ${path}manifest.json`);
    invalidPlugins.push([x, "no manifest.json"]);
    continue;
  }
  if (!existsSync(`${path}status.toml`)) {
    console.log(`Could not find ${path}status.toml`);
    invalidPlugins.push([x, "no status.toml"]);
    continue;
  }

  try {
    const manifest = JSON.parse(await readFile(`${path}manifest.json`, "utf8"));
    const { status, discontinuedFor, external } = parse(
      await readFile(`${path}status.toml`, "utf8")
    );

    const plugin = {
      name: manifest.name,
      description: manifest.description,
      discontinuedFor,
      id: x,
      status,
      links: {
        copy:
          status === "proxied"
            ? {
                title: "copy_proxied_link",
                link: `${links.proxied}${x}`,
              }
            : status === "finished"
            ? {
                title: "copy_link",
                link: `${links.unproxied}${x}`,
              }
            : undefined,
        external: [
          external?.backend && {
            title: "view_backend_code",
            link: `${links.external.backend}${external.backend}`,
          },
        ].filter((x) => !!x),
        code: {
          title: "view_code",
          link: `${links.code}${x}`,
        },
      },
    };
    plugins.push(plugin);

    const badges = {
      copy:
        plugin.links.copy &&
        makeHrefBadge(
          plugin.links.copy.link,
          plugin.links.copy.title,
          undefined,
          undefined,
          1
        ),
      external:
        plugin.links.external[0] &&
        plugin.links.external
          .map((x) => makeHrefBadge(x.link, x.title, undefined, undefined, 1))
          .join("\n"),
    };

    const preadme = `<div align="center">
\t${makeBadge(
      "plugin_status",
      plugin.status,
      statusColors[plugin.status].slice(1)
    )}${badges.copy || badges.external ? `\n\t<br/>` : ""}${
      badges.copy ? "\n\t" : ""
    }${badges.copy ?? ""}${badges.external ? "\n\t" : ""}${
      badges.external ?? ""
    }
</div>
<br/>
<div align="center">
\t<h1>${plugin.name}</h1>
</div>

${plugin.description}`;

    if (existsSync(`${path}READMEE.md`)) await unlink(`${path}READMEE.md`);
    await writeFile(`${path}README.md`, preadme);
    console.log(`Wrote ${path}README.md`);
  } catch (e) {
    console.log(`Failed to parse ${path}!`, e);
    invalidPlugins.push([x, e?.message ?? `${e}`]);
  }
}

const stats = {
  all: plugins.length,
  finished: plugins.filter((x) => ["finished", "proxied"].includes(x.status))
    .length,
  proxied: plugins.filter((x) => x.status === "proxied").length,
  unproxied: plugins.filter((x) => x.status === "finished").length,
  unfinished: plugins.filter((x) => x.status === "unfinished").length,
  discontinued: plugins.filter((x) => x.status === "discontinued").length,
};

const plur = (x, p = "s", s = "") => (x !== 1 ? p : s);

const chart = {
  type: "doughnut",
  data: {
    labels: [
      stats.proxied > 0 && "Proxied",
      stats.unproxied > 0 && "Finished",
      stats.unfinished > 0 && "Unfinished",
      stats.discontinued > 0 && "Discontinued",
    ].filter((x) => !!x),
    datasets: [
      {
        data: [
          stats.proxied,
          stats.unproxied,
          stats.unfinished,
          stats.discontinued,
        ].filter((x) => x > 0),
        backgroundColor: [
          statusColors.proxied,
          statusColors.finished,
          statusColors.unfinished,
          statusColors.discontinued,
        ],
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
  .map((x) => [x[0], plugins.filter((y) => x[1].includes(y.status))])
  .map(
    (x) =>
      `## ${x[0]}\n\n${x[1]
        .map(
          (y) =>
            `- ${y.name} — ${y.description}${
              y.discontinuedFor
                ? `\n\t- **Discontinued For:** ${y.discontinuedFor}`
                : ""
            }\n\t- ${[y.links.copy, y.links.code, ...y.links.external]
              .filter((z) => !!z)
              .map((z) => makeMDHrefBadge(z.link, z.title))
              .join(" ")}`
        )
        .join("\n")}`
  );

const mreadme = `<div align="center">
\t${makeHref(
  "https://github.com/Gabe616/VendettaPlugins/stargazers",
  `<img alt="GitHub stars" src="https://img.shields.io/github/stars/Gabe616/VendettaPlugins?style=for-the-badge&color=${shieldColors.ghstars}&labelColor=${shieldLabelColor}&logo=${shieldLogos.ghstars}">`,
  1
)}
\t${makeHref(
  "https://github.com/Gabe616/VendettaPlugins/issues",
  `<img alt="GitHub issues" src="https://img.shields.io/github/issues/Gabe616/VendettaPlugins?style=for-the-badge&color=${shieldColors.ghissues}&labelColor=${shieldLabelColor}&logo=${shieldLogos.ghissues}">`,
  1
)}
\t${makeHref(
  "https://github.com/Gabe616/VendettaPlugins/pulls",
  `<img alt="GitHub pull requests" src="https://img.shields.io/github/issues-pr/Gabe616/VendettaPlugins?style=for-the-badge&color=${shieldColors.ghpullreqs}&labelColor=${shieldLabelColor}&logo=${shieldLogos.ghpullreqs}">`,
  1
)}
\t${makeHref(
  "https://discord.gg/n9QQ4XhhJP",
  `<img alt="Discord members" src="https://img.shields.io/discord/1015931589865246730?style=for-the-badge&color=${shieldColors.discord}&labelColor=${shieldLabelColor}&logo=${shieldLogos.discord}">`,
  1
)}
</div>
<br/>
<div align="center">
\t<h1>🌙 Vendetta Plugins</h1>
</div>

A collection of all my awesome plugins for Vendetta

# 📊 Stats

I've coded a total of **${stats.all}** plugin${plur(stats.all)}.  
Out of the plugins I've coded, **${stats.finished}** ${plur(
  stats.finished,
  "are finished",
  "is finished"
)} (**${Math.floor((stats.finished / stats.all) * 100)}%**) and **${
  stats.proxied
}** ${plur(stats.proxied, "are proxied", "is proxied")} (**${Math.floor(
  (stats.proxied / stats.all) * 100
)}%**)  
**${stats.unproxied}** plugin${plur(stats.unproxied)} I've coded ${plur(
  stats.unproxied,
  "are",
  "is"
)} currently waiting to be proxied.  
I'm working on **${stats.unfinished}** plugin${plur(stats.unfinished)}, and **${
  stats.discontinued
}** plugin${plur(stats.discontinued, "s are", " is")} discontinued.

<div align="center">
\t<img alt="Stats Pie Chart" src="https://quickchart.io/chart?c=${encodeURIComponent(
  stringifiedChart
)}" width=600 />
</div>

# 📃 Plugin List

${plist.join("\n\n")}${
  invalidPlugins.length > 0
    ? `

> **Note**  
> **${invalidPlugins.length}** plugin${plur(
        invalidPlugins.length,
        "s aren't",
        " isn't"
      )} being shown due to being formatted incorrectly:  
${invalidPlugins.map((x) => `> - ${x[0]}  `).join("\n")}`
    : ""
}`;
// TODO make use of the second parameter in invalidPlugins

if (existsSync("./READMEE.md")) await unlink("./READMEE.md");
await writeFile("./README.md", mreadme);
console.log("Wrote ./README.md");

console.log("");
console.timeEnd("Done");
