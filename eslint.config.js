// @ts-check

import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import unusedImports from "eslint-plugin-unused-imports";
import pathAlias from "eslint-plugin-path-alias";

export default tseslint.config(
    eslint.configs.recommended,
    ...tseslint.configs.recommended,
    {
        languageOptions: {
            parserOptions: {
                project: true,
                tsconfigRootDir: import.meta.dirname,
            },
            globals: {
                performance: false,
                console: false,
                process: false,
                setInterval: false,
                clearInterval: false,
                setTimeout: false,
                clearTimeout: false,
                setImmediate: false,
                clearImmediate: false,
            },
        },
        plugins: {
            "unused-imports": unusedImports,
            "simple-import-sort": simpleImportSort,
            "path-alias": pathAlias,
        },
        rules: {
            // base disables
            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/no-namespace": "off",

            // hand picked from strict
            "@typescript-eslint/no-extraneous-class": "error",
            "@typescript-eslint/no-invalid-void-type": "error",
            "@typescript-eslint/no-non-null-asserted-nullish-coalescing":
                "error",
            "@typescript-eslint/prefer-literal-enum-member": [
                "error",
                { allowBitwiseExpressions: true },
            ],
            "@typescript-eslint/unified-signatures": "error",
            "no-useless-constructor": "off",
            "@typescript-eslint/no-useless-constructor": "error",

            // https://github.com/Vendicated/Vencord/blob/main/.eslintrc.json
            eqeqeq: ["error", "always", { null: "ignore" }],
            yoda: "error",
            "operator-assignment": "error",
            "no-useless-computed-key": "error",
            "no-unneeded-ternary": ["error", { defaultAssignment: false }],
            "no-constant-condition": ["error", { checkLoops: "none" }],
            "no-duplicate-imports": "error",
            "dot-notation": "error",
            "no-cond-assign": "error",
            "prefer-const": "error",
            "prefer-spread": "error",
            "prefer-destructuring": [
                "error",
                {
                    VariableDeclarator: { array: false, object: true },
                    AssignmentExpression: { array: false, object: false },
                },
            ],

            // plugins
            "simple-import-sort/imports": "error",
            "simple-import-sort/exports": "error",

            "@typescript-eslint/no-unused-vars": "off",
            "unused-imports/no-unused-imports": "error",
            "unused-imports/no-unused-vars": [
                "warn",
                {
                    vars: "all",
                    varsIgnorePattern: "^_",
                    args: "after-used",
                    argsIgnorePattern: "^_",
                },
            ],
        },
    },
    {
        ignores: [
            "dist/**/*.*",
            "eslint.config.js", // no clue why this is needed but im not gonna complain
        ],
    },
);
