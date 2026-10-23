// The Marko runtime as text, so templates compile and bundle in the browser.
// The runtime dist is code-split (each `*.feat` module is its own entry sharing
// hashed chunks with the main entries), so every module is captured, not just
// `marko/dom` and `marko/html`. A plain Vite glob does this without a plugin.
const modules = import.meta.glob<string>(
  "/node_modules/marko/dist/{,debug/}{dom,html}{,-*,/**/*}.mjs",
  { query: "?raw", import: "default", eager: true },
);

const prefix = "/node_modules/marko/dist/";
const runtimeFiles: Record<string, string> = {};
for (const path in modules) {
  runtimeFiles[`marko/${path.slice(prefix.length)}`] = modules[path];
}

export default runtimeFiles;
