import path from "node:path";
import { defineConfig } from "vite";
import marko from "@marko/run/vite";
import unocss from "unocss/vite";
import markodown from "./src/util/markodown";

export default defineConfig({
  // BASE_URL is set to "/previews/pr-N/" by the PR Preview workflow so the site can be
  // served from a subdirectory on GitHub Pages. Defaults to "/" for the production deploy.
  base: process.env.BASE_URL || "/",
  environments: {
    client: {
      define: {
        __dirname: "'/'",
        global: "globalThis",
        "process.browser": true,
        "process.env": {},
        "process.env.BUNDLE": true,
        "process.env.BABEL_TYPES_8_BREAKING": false,
        "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
      },
    },
  },
  build: {
    rollupOptions: {
      external: ["browserslist"],
    },
  },
  resolve: {
    alias: [
      // marko/translator uses `node:path` which must be shimmed for browser environments.
      // The shim re-exports from path-browserify. Named exports are bound from the default
      // so they work in both Rollup (build) and Vite's SSR module runner (dev).
      {
        find: "node:path",
        replacement: path.resolve("./shim/path/browser.js"),
      },
      // prettier-plugin-marko (used by the playground formatter) imports `doc` from the
      // full, node-only prettier build; map the bare specifier to the browser standalone
      // build. Anchored so `prettier/standalone` and `prettier/plugins/*` are untouched.
      {
        find: /^prettier$/,
        replacement: "prettier/standalone",
      },
    ],
  },
  optimizeDeps: {
    include: ["flexsearch"],
    exclude: ["@rollup/browser", "lightningcss-wasm"],
  },
  plugins: [markodown(), marko(), unocss()],
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
