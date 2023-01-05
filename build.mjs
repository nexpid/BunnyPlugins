import { rollup } from "rollup";
import { readFile, writeFile, readdir } from "fs/promises";
import { createHash } from "crypto";
import externalGlobals from "rollup-plugin-external-globals";
import esbuild from "rollup-plugin-esbuild";
import nodeResolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";

for (let plug of await readdir("./plugins")) {
    const manifest = JSON.parse(await readFile(`./plugins/${plug}/manifest.json`));
    const out = `./dist/${plug}/${manifest.main.split("/").reverse()[0]}`;

    try {
        const bundle = await rollup({
            input: `./plugins/${plug}/${manifest.main}`,
            onwarn: () => {},
            plugins: [
                nodeResolve(),
                commonjs(),
                externalGlobals({
                    react: "window.React",
                    vendetta: "window.vendetta"
                }),
                esbuild({
                    target: "esnext",
                    minify: true,
                })
            ],
        });
    
    
        await bundle.write({
            file: out,
            format: "iife",
            compact: true,
            exports: "named",
        });
        await bundle.close();
    
        const toHash = await readFile(out);
        manifest.hash = createHash("sha256").update(toHash).digest("hex");
        await writeFile(`./dist/${plug}/manifest.json`, JSON.stringify(manifest));
    
        console.log("Build successful!");
    } catch (e) {
        console.error("Build failed...", e);
        process.exit(1);
    }
}