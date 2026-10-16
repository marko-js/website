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
