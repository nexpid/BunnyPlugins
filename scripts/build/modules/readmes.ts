import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

import { format } from "prettier";

import { stringifyChart } from "../lib/chart.ts";
import {
    branch,
    isDevBranch,
    makeMdNote,
    markdownPrettierOptions,
    plural,
} from "../lib/common.ts";
import { listPlugins } from "./plugins.ts";

const mdNote = makeMdNote("scripts/build/modules/readmes.ts", "md");
const links = {
    // STUB[epic=proxy] vendetta.nexpid.xyz => bunny.nexpid.xyz
    proxied: "https://bn-plugins.github.io/vd-proxy/vendetta.nexpid.xyz/",
    base: `https://${isDevBranch ? "dev." : ""}bunny.nexpid.xyz/`,
    code: `https://github.com/nexpid/BunnyPlugins/tree/${branch}/src/plugins/`,
    external: {
        backend: "https://github.com/nexpid/",
    },
};

const LabelColor = {
    Status: "#24273a",
    ProxiedLink: "#181926",
    UnproxiedLink: "#1e2030",
    CodeLink: "#363a4f",
    ExternalLink: "#494d64",
};

const categories = {
    finished: {
        label: "✅ Finished",
        color: "#a6da95",
    },
    unfinished: {
        label: "❌ Unfinished",
        color: "#b8c0e0",
    },
    discontinued: {
        label: "🎫 Discontinued",
        color: "#ed8796",
    },
};

const shields = {
    stars: {
        color: "#8BFA6B",
        icon: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAADoSURBVHgB3ZThDcIgEEaPTlAnsBu0G5RNdAQ3cARHsCO4AXGCsoFuoBucR0RLECin9I8vuRDj9XsHbQBggIg7U7AEFCxxQkJpKFQ5AgUl8aYvvwtv+rK7iEz/+y7o4ZqqoxoTAmV6UjniNSUtLZVpru3aAI+rLW3XsxBCCzMp/bjBMqwqstyttTTaZr/PO3XWXEZ7MhMFJZ/hnkTh96houCcakM8xlFVFHAPwOXEELfBpOAIJfDqOYP5FZQqCzHwll8h/ebcBPi+4UHDv9GwjonWOwL2eTcgm0euLesiBGg+p4IhoD3/JA/V6amAVi052AAAAAElFTkSuQmCC",
    },
    issues: {
        color: "#C6FA6B",
        icon: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAFYSURBVHgBtVaNlYIwDA5OwAiM4AaygW4gG5QNYAPYgNuAEXoj3AbcBtwGufSZaKzSFtTvvTxsyB9fm1SAABAxJ2lJLMmEN8ysMyQFrIVz4gCpGJITkWHNFepqO5IzyYHlyEEnz66OBW+Vg3M+JxRUeYnaUOUCS5JDIpjSUfnXzwyElhE2Am/7Nt/tCfMptBSwEXg5dUKX1dULopwnJKlUvNwpjFQPb4Kiu9nR+sT67wTHvROI44ufpc52jATv1ad3EdvqyopyOkC4ch/7gH0pRjv4MFyCX/5dLBllWfZDj16petYtQZr0TzdHkFeH1E1WfWXdouHFDG+CajYj3fepRitEaeVY4Yoh9yR4oaof/BfzlbftCWSi3g87fqnH9Ygrhh7TbJW/WTJslNGE2y6cJubgX5nOeSA54aVDSw7a4ePVaiAFvCcDpsPiC/8uDAfwv8oypcFT9w+9QRTccPHn0gAAAABJRU5ErkJggg==",
    },
    pulls: {
        color: "#FAF76B",
        icon: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAE8SURBVHgB7VXRjcIwDHXRDcAIGaEbXG8C2OC6wd0GHYEROsLpJoiYAJigMEG6gXFVFxzjpoAEP/Ckp9Tts50msQPwbCBiQayI3wlNTgxwK8jJY4yG6Kzg3Ue4BaQvReCNePZWcEbBdNck8OxUs71kO7DtVHCNmjjXcWfiueXR8ZgrbSs0FkpiDYk/KEZmthIax/uCcg+wPxQD5qkklQr+px1kEvV+wCekIJL4hMbp72MJPuAOZFm2p+HrGu0MHox3ghdIEIHO8K/qN3WyMuFcE8KnIS4tYYk2qokEjeETLibGbeHUHoirQZwInssKxrjj/nQaaw9aqtSua+7YTi6RwIErvDX9MG50XsxktAXznwax9vKicpaDxxgNTtxW2F9MYWzfMsNhAf1lsyf+83LBRBJHw4LNLfms4Vk4AilnOCIsG873AAAAAElFTkSuQmCC",
    },
    discord: {
        color: "#FAE66B",
        icon: "discord",
    },
};

/**
 * @param {import("../types").Readmes.Badge} badge
 * @param {boolean=} mdLink
 */
function makeBadge(badge, mdLink) {
    const chunks = [
        badge.text,
        badge.value && badge.value?.text,
        badge.value && badge.value?.color?.slice(1),
        !badge.value && badge.color.slice(1),
    ]
        .filter(x => !!x)
        .join("-");

    const params = new URLSearchParams();
    params.append("style", "for-the-badge");
    if (badge.value) params.append("labelColor", badge.color.slice(1));
    if (badge.icon) {
        params.append("logo", badge.icon);
        params.append("logoColor", "fff");
    }

    const img = `<img alt=${JSON.stringify(badge.text)} src=${JSON.stringify(`https://img.shields.io/badge/${chunks}?${params.toString()}`)} />`;

    if (badge.link)
        return mdLink
            ? `[${img}](${badge.link})`
            : `<a href=${JSON.stringify(badge.link)}>${img}</a>`;
    else return img;
}

/**
 * @param {import("../types").Readmes.EndpointBadge} badge
 * @param {boolean=} mdLink
 */
function makeEndpointBadge(badge, mdLink) {
    const params = new URLSearchParams();
    params.append("style", "for-the-badge");
    params.append("label", badge.text);
    params.append("labelColor", badge.color.slice(1));
    if (badge.icon) {
        params.append("logo", badge.icon);
        params.append("logoColor", "fff");
    }
    if (badge.value?.color) params.append("color", badge.value.color.slice(1));

    const img = `<img alt=${JSON.stringify(badge.text)} src=${JSON.stringify(`https://img.shields.io/${badge.endpoint}?${params.toString()}`)} />`;

    if (badge.link)
        return mdLink
            ? `[${img}](${badge.link})`
            : `<a href=${JSON.stringify(badge.link)}>${img}</a>`;
    else return img;
}

/** @param {noDev=} boolean */
async function listPluginMetadatas(noDev) {
    /** @type {import("../types").Readmes.Plugin[]} */
    const plugins = [];

    for (const { name: plugin } of await listPlugins(noDev)) {
        /** @type {import("../types").Readmes.Manifest} */
        const manifest = JSON.parse(
            await readFile(
                join("src/plugins/", plugin, "manifest.json"),
                "utf8",
            ),
        );
        /** @type {import("../types").Readmes.Status} */
        const status = JSON.parse(
            await readFile(join("src/plugins/", plugin, "status.json"), "utf8"),
        );

        const proxied = !isDevBranch ? !!status.proxied : false;

        plugins.push({
            id: plugin,
            name: manifest.name,
            description: manifest.description,
            status: status.status,
            proxied,
            discontinuedFor: status.discontinuedFor,
            badges: {
                status: {
                    color: LabelColor.Status,
                    text: "plugin_status",
                    value: {
                        color: categories[status.status].color,
                        text: status.status,
                    },
                },
                links: [
                    proxied
                        ? {
                              text: "copy_proxied_link",
                              color: LabelColor.ProxiedLink,
                              link: links.proxied + plugin,
                          }
                        : null,
                    {
                        text: isDevBranch ? "copy_dev_link" : "copy_link",
                        color: LabelColor.UnproxiedLink,
                        link: links.base + plugin,
                    },
                    {
                        text: "view_code",
                        color: LabelColor.CodeLink,
                        link: links.code + plugin,
                    },
                    status.external?.backend
                        ? {
                              text: "view_backend_code",
                              color: LabelColor.ExternalLink,
                              link:
                                  links.external.backend +
                                  status.external.backend,
                          }
                        : null,
                ].filter(x => x !== null),
            },
        });
    }

    return plugins;
}

/** @param {string[]=} filter */
export async function writePluginReadmes(filter = []) {
    for (const plugin of (await listPluginMetadatas()).filter(plugin =>
        filter.length !== 0 ? filter.includes(plugin.name) : true,
    )) {
        await writeFile(
            `src/plugins/${plugin.id}/README.md`,
            await format(
                [
                    `${mdNote}\n`,
                    // header
                    '<div align="center">',
                    makeBadge(plugin.badges.status),
                    "<br/>",
                    plugin.badges.links
                        .filter(x => x.color !== LabelColor.CodeLink)
                        .map(badge => makeBadge(badge))
                        .join("\n"),
                    // footer
                    "</div>\n",
                    `<h1 align="center">${plugin.name}</h1>\n`,
                    plugin.description,
                ].join("\n"),
                {
                    parser: "markdown",
                    ...markdownPrettierOptions,
                },
            ),
        );
    }
}

export async function writeRootReadme() {
    const plugins = await listPluginMetadatas(true);
    const stats = {
        finished: plugins.filter(plugin => plugin.status === "finished").length,
        unfinished: plugins.filter(plugin => plugin.status === "unfinished")
            .length,
        discontinued: plugins.filter(plugin => plugin.status === "discontinued")
            .length,
    };

    const chart = stringifyChart(
        {
            type: "doughnut",
            data: {
                labels: [
                    stats.finished > 0 && "Finished",
                    stats.unfinished > 0 && "Unfinished",
                    stats.discontinued > 0 && "Discontinued",
                ].filter(x => !!x),
                datasets: [
                    {
                        data: [
                            stats.finished,
                            stats.unfinished,
                            stats.discontinued,
                        ].filter(x => x > 0),
                        backgroundColor: [
                            stats.finished > 0 && categories.finished.color,
                            stats.unfinished > 0 && categories.unfinished.color,
                            stats.discontinued > 0 &&
                                categories.discontinued.color,
                        ].filter(x => !!x),
                        datalabels: {
                            labels: {
                                index: {
                                    color: "#fff",
                                    font: {
                                        size: 18,
                                    },
                                    align: "end",
                                    anchor: "end",
                                    formatter: (_, ctx) =>
                                        ctx.chart.data.labels[ctx.dataIndex],
                                },
                                name: {
                                    color: "#222",
                                    backgroundColor: "#fff",
                                    borderRadius: 4,
                                    offset: 0,
                                    padding: 2,
                                    font: {
                                        size: 16,
                                    },
                                    align: "top",
                                    formatter: val =>
                                        `${Math.floor((val / plugins.length) * 100)}%`,
                                },
                                value: {
                                    color: "#fff",
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
                                text: plugins.length,
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
        },
        {
            "plugins.length": plugins.length,
        },
    );

    await writeFile(
        "README.md",
        await format(
            [
                `${mdNote}\n`,

                '<h1 align="center">🐇 Bunny Plugins</h1>',
                '<p align="center">A collection of all my awesome plugins for <a href="https://github.com/pyoncord/Bunny#installing">Bunny</a>.</p>\n',
                // header
                '<div align="center">',
                makeEndpointBadge({
                    endpoint: "github/stars/nexpid/BunnyPlugins",
                    text: "stars",
                    color: LabelColor.Status,
                    icon: shields.stars.icon,
                    value: {
                        color: shields.stars.color,
                    },
                }),
                makeEndpointBadge({
                    endpoint: "github/issues/nexpid/BunnyPlugins",
                    text: "issues",
                    color: LabelColor.Status,
                    icon: shields.issues.icon,
                    value: {
                        color: shields.issues.color,
                    },
                }),
                makeEndpointBadge({
                    endpoint: "github/issues-pr/nexpid/BunnyPlugins",
                    text: "pull requests",
                    color: LabelColor.Status,
                    icon: shields.pulls.icon,
                    value: {
                        color: shields.pulls.color,
                    },
                }),
                makeEndpointBadge({
                    endpoint: "discord/1196075698301968455",
                    text: "pyoncord chat",
                    color: LabelColor.Status,
                    icon: shields.discord.icon,
                    value: {
                        color: shields.discord.color,
                    },
                }),
                // footer
                "</div>\n",

                "> [!IMPORTANT]  ",
                "> My plugins assume you're using version atleast **211.10** (211210) from **January 1st**, they might not work properly if you use an older version than that.\n",

                "## 🌐 Localization\n",

                '<a href="https://crowdin.com/project/nexpid-vendetta-plugins">',
                '<img src="assets/localization.png" alt="Help me by translating my plugins into your language on Crowdin!" />',
                "</a>\n",

                "## 📊 Stats\n",

                `- I've coded a total of **${plugins.length}** ${plural(plugins.length, "plugin", "plugins")}`,
                `- I finished **${stats.finished}** ${plural(stats.finished, "plugin", "plugins")}, and I'm working on **${stats.unfinished}** ${plural(stats.unfinished, "plugin", "plugins")}`,
                `- **${stats.discontinued}** of my plugins ${plural(stats.discontinued, "is", "are")} discontinued.\n`,

                // header
                '<div align="center">',
                `<img alt="Stats Pie Chart" src=${JSON.stringify(`https://quickchart.io/chart?c=${chart}`)} width="600" />`,
                // footer
                "</div>\n",

                "## 📃 Plugin List\n",

                Object.entries(categories)
                    .map(([status, { label }]) =>
                        [
                            `### ${label}\n`,
                            ...plugins
                                .filter(plugin => plugin.status === status)
                                .map(plugin =>
                                    [
                                        `- ${plugin.name} — ${plugin.description}`,
                                        plugin.discontinuedFor &&
                                            `  - **Discontinued due to:** ${plugin.discontinuedFor}`,
                                        `  - ${plugin.badges.links.map(link => makeBadge(link, true)).join("  ")}`,
                                    ]
                                        .filter(x => !!x)
                                        .join("\n"),
                                ),
                        ].join("\n"),
                    )
                    .join("\n\n") + "\n",

                "## 📜 Licensing\n",

                "<details>",
                "<summary>This project now uses the CC-BY-4.0 license</summary>",
                "The Creative Commons Attribution 4.0 International License is an open and flexible license that grants users the ability to share, adapt, and build upon the contents of this project for any purpose, including commercial endeavors. Under this license, users are required to provide appropriate attribution to the original author(s), acknowledging their contribution to the work. This license promotes collaboration and innovation by allowing individuals and organizations to leverage and modify the project while ensuring that credit is given to the creators.",
                "</details>",
            ].join("\n"),
            {
                parser: "markdown",
                ...markdownPrettierOptions,
            },
        ),
    );
}
