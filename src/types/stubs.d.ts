declare module "virtual:marko-runtime-files" {
  const files: Record<string, string>;
  export default files;
}

declare module "@ebay/browserslist-config" {
  const config: string[];
  export default config;
}

declare module "@marko/compiler/modules" {
  const modules: {
    cwd: string;
    root: string;
    require: null | ((id: string) => unknown);
    resolve: null | ((id: string, from?: string) => string);
    tryResolve: null | ((id: string, from?: string) => string | undefined);
  };
  export default modules;
}

declare module "lasso-package-root" {
  const lassoPackageRoot: {
    getRootPackage(
      dirname: string,
    ): { __dirname: string; [key: string]: unknown } | undefined;
  };
  export default lassoPackageRoot;
}

// The read-only virtual-disk seed (TypeScript libs + Marko type defs), provided
// by the `marko-lsp-assets` Vite plugin. Keyed by absolute virtual path.
declare module "virtual:marko-lsp-assets" {
  const assets: Record<string, string>;
  export default assets;
}
