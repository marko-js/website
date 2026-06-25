declare module "@ebay/browserslist-config" {
  const config: string[];
  export default config;
}

// Aliased Marko versions used by the playground version toggle. Their runtime
// `?raw` imports are already typed by vite/client's `*?raw` declaration; only
// the translator entrypoint needs a stub, which mirrors the default `marko`.
declare module "marko-6_1_18/translator" {
  const translator: typeof import("marko/translator");
  export = translator;
}
