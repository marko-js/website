import { defineConfig } from "vite";
import marko from "@marko/run/vite";
import markodown from "./src/util/markodown";
import { nodePolyfills } from "vite-plugin-node-polyfills";

export default defineConfig({
  plugins: [
    markodown(),
    marko(),
    {
      ...nodePolyfills({
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
      apply: "serve",
    },
  ],
});
