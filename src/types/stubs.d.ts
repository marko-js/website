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
    getRootPackage:
      | null
      | ((
          dirname: string,
        ) => { __dirname: string; [key: string]: unknown } | undefined);
  };
  export default modules;
}
