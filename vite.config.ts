import path from "node:path";
import { defineConfig } from "vite";
import marko from "@marko/run/vite";
import markodown from "./src/util/markodown";
import { patchCssModules } from "vite-css-modules";

export default defineConfig({
  environments: {
    client: {
      define: {
        global: "globalThis",
        "process.browser": true,
        "process.env.BUNDLE": true,
        "process.env.BABEL_TYPES_8_BREAKING": false,
        "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
      },
    },
  },
  plugins: [
    patchCssModules({
      exportMode: "named",
      generateSourceTypes: true,
    }),
    markodown(),
    marko(),
  ],
  css: {
    modules: {
      generateScopedName:
        process.env.NODE_ENV === "production"
          ? (() => {
              const chars =
                "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_";
              const indexes = ((globalThis as any).__CSS_MODULE_INDEXES__ ||=
                new Map()) as Map<string, number>;
              return (name: string, filename: string) => {
                const key = `${filename}:${name}`;
                let n = indexes.get(key);
                let id = "";

                if (n === undefined) {
                  n = indexes.size;
                  indexes.set(key, n);
                }

                do {
                  id = chars[n % chars.length] + id;
                  n = Math.floor(n / chars.length);
                } while (n > 0);
                return `_${id}`;
              };
            })()
          : (name: string, filename: string) => {
              return `${path
                .relative(process.cwd(), filename)
                .replace(/[^\w/.-]/g, "_")
                .replace(/[/.]/g, "\\$&")}\\#${name}`;
            },
    },
  },
});
