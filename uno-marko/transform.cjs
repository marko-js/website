// Marko compile-time transform that makes UnoCSS "compile mode" work.
//
// Why this exists: UnoCSS's compile-class transformer runs in Vite's transform
// phase, so it only rewrites a component's own module. Marko's cross-template
// compilation re-reads child `.marko` files straight from disk through
// `@marko/compiler` (bypassing Vite), so the child is seen as two different byte
// sequences in one build. Marko's export ids come from a filename-keyed, source-
// agnostic counter, which then desyncs (`$setup` -> `$setup2`), producing
// MISSING_EXPORT. Running the substitution *inside* the compiler instead fixes
// this: this transform runs in every compilation (the module and the disk-read
// dependency pass), in the "transform" stage that precedes export minting, so all
// passes see identical bytes.
//
// It rewrites  ":uno: <utilities>"  ->  "uno-<hash>"  and records the mapping on a
// global store that `uno.config.ts` reads to generate the CSS for each class.
const store = (globalThis.__UNO_MARKO_STORE__ ||= new Map());

// FNV-1a, matching UnoCSS's compile-class hash so class names look familiar.
function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
  }
  return ("00000" + (h >>> 0).toString(36)).slice(-6);
}

module.exports = {
  StringLiteral(path) {
    const value = path.node.value;
    if (typeof value !== "string" || !value.startsWith(":uno:")) return;
    const body = value.slice(5).trim().replace(/\s+/g, " ");
    if (!body) return;
    const className = "uno-" + hash(body);
    store.set(className, body);
    path.node.value = className;
  },
};
