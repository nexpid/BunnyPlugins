import { rollup } from "rollup";
import { readFile, writeFile, readdir } from "fs/promises";
import { createHash } from "crypto";
import esbuild from "rollup-plugin-esbuild";
import nodeResolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";

for (let plug of await readdir("./plugins")) {
    const manifest = JSON.parse(await readFile(`./plugins/${plug}/manifest.json`));
    const outName = manifest.main.split("/").reverse()[0];
    const outPath = `./dist/${plug}/${outName}`;

    try {
        const bundle = await rollup({
            input: `./plugins/${plug}/${manifest.main}`,
            onwarn: () => {},
            plugins: [
                nodeResolve(),
                commonjs(),
                esbuild({
                    target: "esnext",
                    minify: true,
                })
            ],
        });
    
        await bundle.write({
            file: outPath,
            globals(id) {
                if (id.startsWith("@vendetta")) return id.substring(1).replace(/\//g, ".");
                const map = {
                    react: "window.React",
                };

                return map[id] || null;
            },
            format: "iife",
            compact: true,
            exports: "named",
        });
        await bundle.close();
    
        const toHash = await readFile(outPath);
        manifest.hash = createHash("sha256").update(toHash).digest("hex");
        manifest.main = outName;
        await writeFile(`./dist/${plug}/manifest.json`, JSON.stringify(manifest));
    
        console.log(`Successfully built ${manifest.name}!`);
    } catch (e) {
        console.error("Failed to build plugin...", e);
        process.exit(1);
    }
}