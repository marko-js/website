import { defineConfig } from "vitest/config";
import markoRuntimeFiles from "./src/util/marko-runtime-files";

// Kept separate from vite.config.ts on purpose. These are plain unit tests over
// `src/util`, and resolving the site's plugin chain to run them roughly triples
// vitest's startup for no benefit.
export default defineConfig({
  plugins: [markoRuntimeFiles()],
  test: {
    include: ["src/**/*.test.ts"],
  },
});
