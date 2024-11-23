import { readdir, readFile, writeFile } from "fs/promises";
import { basename, dirname, join } from "path";

export async function makeDocsIconsHook() {
    const files = await readdir("src", { recursive: true });
    const tpconfigs = (
        await Promise.all(
            files
                .map(x => x.replace(/\\/g, "/"))
                .filter(x => x.endsWith("/tpconfig.json"))
                .map(async file => ({
                    parent: dirname(file),
                    config: JSON.parse(
                        await readFile(join("src", file), "utf8"),
                    ) as {
                        root: string;
                    },
                    depth: file.split("/").length,
                })),
        )
    ).sort((a, b) => b.depth - a.depth);

    // Gather all custom icons
    const res = new Array<
        | {
              tag: string;
          }
        | {
              alt: string;
              path: string;
              location: string;
              tag: string;
          }
    >();

    for (const file of files.filter(x => x.endsWith(".png")).sort()) {
        const dirnm = dirname(file).replace(/\\/g, "/");
        const config = tpconfigs.find(cfg => dirnm.startsWith(cfg.parent));
        if (!config) continue;

        const tag = config.config.root;
        if (res[res.length - 1]?.tag !== tag)
            res.push({
                tag,
            });

        res.push({
            alt: `${config.config.root} ${basename(file).split(".").slice(0, -1).join(".")}`,
            path: `${config.config.root}${dirnm.slice(config.parent.length)}/${basename(file)}`,
            location: join("..", "src", file).replace(/\\/g, "/"),
            tag,
        });
    }

    // Modify ICONS.md yea!!

    const iconsMd = await readFile("docs/ICONS.md", "utf8");
    const [prefix, rest] = iconsMd.split("<!-- icons hook start -->");
    const [_, suffix] = rest.split("<!-- icons hook end -->");

    await writeFile(
        "docs/ICONS.md",
        `${prefix}<!-- icons hook start -->\n${res.map(icon => (!("location" in icon) ? `\n### ${icon.tag}\n` : `- <img src=${JSON.stringify(icon.location)} alt=${JSON.stringify(icon.alt)} width=20 height=20 /> — \`${icon.path}\``)).join("\n")}\n\n<!-- icons hook end -->${suffix || ""}`,
    );
}
