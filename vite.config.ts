import { defineConfig } from "vite";
import marko from "@marko/run/vite";
import markodown from "./src/util/markodown";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import { patchCssModules } from "vite-css-modules";

export default defineConfig({
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
