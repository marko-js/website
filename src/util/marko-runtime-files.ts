import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import type { Plugin } from "vite";

// The playground compiles user templates in the browser, so it needs the
// marko runtime sources as text. The runtime dist is code-split (each
// `*.feat` module is its own entry sharing hashed chunks with the main
// entries), so every module is captured — not just `marko/dom` etc.
export default function markoRuntimeFiles(): Plugin {
  const virtualId = "virtual:marko-runtime-files";
  const resolvedId = `\0${virtualId}`;
  return {
    name: "marko-runtime-files",
    resolveId(id) {
      if (id === virtualId) return resolvedId;
    },
    load(id) {
      if (id !== resolvedId) return;
      const distDir = path.join(
        path.dirname(
          createRequire(import.meta.url).resolve("marko/package.json"),
        ),
        "dist",
      );
      const files: Record<string, string> = {};
      for (const file of fs.globSync("{,debug/}{dom,html}{,-*,/**/*}.mjs", {
        cwd: distDir,
      })) {
        files[`marko/${file.replaceAll(path.sep, "/")}`] = fs.readFileSync(
          path.join(distDir, file),
          "utf8",
        );
      }
      return `export default ${JSON.stringify(files)}`;
    },
  };
}
