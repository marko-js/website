import { defineConfig } from "vite";
import marko from "@marko/run/vite";
import markodown from "./src/util/markodown";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import { patchCssModules } from "vite-css-modules";
const scopedNames = new Map<string, string>();

export default defineConfig({
  css: {
    modules: {
      generateScopedName(name, filename) {
        const key = `${filename}:${name}`;
        let className = scopedNames.get(key);
        if (!className) {
          const chars =
            "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_";
          let n = scopedNames.size;
          let s = ""
          do {
            s = chars[n % chars.length] + s;
            n = Math.floor(n / chars.length);
          } while (n > 0);
          className = `_${s}`;
          scopedNames.set(key, className);
        }

        return className;
      },
    },
  },
  plugins: [
    patchCssModules({
      exportMode: "default",
      generateSourceTypes: true,
    }),
    markodown(),
    marko(),
    {
      ...nodePolyfills({
        globals: {
          process: true,
          global: true,
          Buffer: true,
        },
        include: [
          "path",
          "events",
          "tty",
          "util",
          "module",
          "process",
          "crypto",
          "stream",
        ],
      }),
      apply(_, env) {
        return (
          env.command === "serve" ||
          (env.command === "build" && !env.isSsrBuild)
        );
      },
    },
  ],
});
