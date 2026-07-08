declare module "@ebay/browserslist-config" {
  const config: string[];
  export default config;
}

// The read-only virtual-disk seed (TypeScript libs + Marko type defs), provided
// by the `marko-lsp-assets` Vite plugin. Keyed by absolute virtual path.
declare module "virtual:marko-lsp-assets" {
  const assets: Record<string, string>;
  export default assets;
}
