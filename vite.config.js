import { defineConfig } from "vite";
import marko from "@marko/run/vite";
import markodown from "./src/util/markodown.js";

export default defineConfig({
  plugins: [markodown(), marko()],
});
