# rollup-plugin-tsconfig-paths

[npm:latest]: https://www.npmjs.com/package/rollup-plugin-tsconfig-paths/v/latest
[npm:latest:badge]: https://img.shields.io/npm/v/rollup-plugin-tsconfig-paths/latest?style=flat-square

[![Latest Version][npm:latest:badge]][npm:latest]

Rollup plugin for resolving tsconfig paths

```sh
npm install --save-dev rollup-plugin-tsconfig-paths
```

rollup.config.js

```js

import tsConfigPaths from "rollup-plugin-tsconfig-paths"
import nodeResolve from "@rollup/plugin-node-resolve"
import commonjs from "@rollup/plugin-commonjs"

export default {
  plugins: [
    tsConfigPaths(),
    nodeResolve({ extensions: [".tsx", ".ts", ".jsx", ".js", ".json", ...] }),
    commonjs(),
  ]
}
```

Example tsconfig.json

```json
{
  "compilerOptions": {
    "jsx": "preserve",
    "module": "esnext",
    "moduleResolution": "node",
    "target": "esnext",
    "lib": ["esnext", "dom", "dom.iterable"],
    "types": ["react", "webpack-env"],
    "baseUrl": ".",
    "paths": {
      "~/*": ["./*"]
    }
  }
}
```

Then you can import alias instead of annoying path

```js
// import App from "../../../../App"
import App from "~/App"

...

```

## Options

### tsConfigPath _(string | string[])_

Specify set where your TypeScript configuration file.

If not set:

- use Environment variable **TS_NODE_PROJECT**
- or search tsconfig.json in current working directory.

### logLevel _("none" | "error" | "warn" | "info" | "debug" | "trace") (default: "info")_

Log level when the plugin is running.

## reference

- https://www.typescriptlang.org/docs/handbook/module-resolution.html#path-mapping
- https://github.com/microsoft/TypeScript/issues/5039
