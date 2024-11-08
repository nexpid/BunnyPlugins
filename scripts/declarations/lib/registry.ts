import { basename, join } from "node:path";
import { PassThrough } from "node:stream";
import { gunzipSync } from "node:zlib";

import { generateDtsBundle } from "dts-bundle-generator";
import { cp, mkdir, readFile, writeFile } from "fs/promises";
import { extract } from "tar-fs";

import {
    listImports,
    slashJoin,
    slashResolve,
} from "../../common/parser/getImports";

export async function getTarball(pkg: string, version: string) {
    const orgLessPackage = pkg.split("/").slice(-1)[0];
    return gunzipSync(
        await fetch(
            `https://registry.npmjs.com/${pkg}/-/${orgLessPackage}-${version}.tgz`,
        ).then(tgz => tgz.arrayBuffer()),
    );
}

export async function unzipTarball(path: string, tarball: ArrayBuffer) {
    await mkdir(path, { recursive: true });
    await (() =>
        new Promise<void>(res => {
            const buffStream = new PassThrough();
            buffStream.end(new Uint8Array(tarball));
            buffStream.pipe(
                extract(path, {
                    ignore(name: string) {
                        return (
                            name !== join(path, "package", "package.json") &&
                            !basename(name).endsWith(".d.ts")
                        );
                    },
                    finish: res,
                }),
            );
        }))();

    return join(path, "package");
}

function addDeclareModule(
    pkg: string,
    bundle: string,
    includeHeader?: boolean,
) {
    const lines = bundle.split("\n");

    const header = lines.slice(0, includeHeader ? 2 : 0).join("\n");
    const content = lines
        .slice(includeHeader ? 2 : 0, -1)
        .map(line => " ".repeat(4) + line)
        .join("\n");

    return `${header ? `${header}\n` : ""}declare module ${JSON.stringify(pkg)} {\n${content}\n};\n`;
}

function getTypes(packageJson: any) {
    const types: string = packageJson.typings ?? packageJson.types;
    return types.endsWith(".d.ts") ? types : `${types}.d.ts`;
}

export async function rollupDts(path: string, pkg: string, out: string) {
    const packageJson = JSON.parse(
        await readFile(join(path, "package.json"), "utf8"),
    ) as any;
    const types = getTypes(packageJson);

    const bundle = generateDtsBundle([
        {
            filePath: join(path, types),
            output: {
                exportReferencedTypes: false,
            },
        },
    ])[0];

    await writeFile(out, addDeclareModule(pkg, bundle, true));
}

// UNFINISHED :(
export async function copyDts(path: string, pkg: string, out: string) {
    const packageJson = JSON.parse(
        await readFile(join(path, "package.json"), "utf8"),
    ) as any;

    // let's hope types is index.d.ts, otherwise this won't work lol
    const types = getTypes(packageJson);
    const root = join(path, types, "..");
    const thing = slashResolve(join(path, types));

    await writeFile(
        thing,
        addDeclareModule(pkg, await readFile(thing, "utf8")),
    );

    // get list of used files
    const usedFiles = new Set<string>();
    async function goThroughImports(imports: Set<string>) {
        for (const imp of imports.values()) {
            if (usedFiles.has(imp)) continue;

            usedFiles.add(imp);
            if (!usedFiles.has(slashJoin(imp, "..")))
                usedFiles.add(slashJoin(imp, ".."));
            if (!usedFiles.has(slashJoin(imp, "..", "..")))
                usedFiles.add(slashJoin(imp, "..", ".."));

            await goThroughImports(await listImports(imp));
        }
    }

    usedFiles.add(thing);
    await goThroughImports(await listImports(thing));

    if (pkg === "react-native-reanimated") console.log(usedFiles);

    await mkdir(out, { recursive: true });
    await cp(root, out, {
        recursive: true,
        force: true,
        filter(source) {
            return usedFiles.has(slashResolve(source).slice(4));
        },
    });
}
