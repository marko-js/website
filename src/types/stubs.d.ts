declare module "@ebay/browserslist-config" {
  const config: string[];
  export default config;
}

declare module "semver/ranges/max-satisfying" {
  const maxSatisfying: (
    versions: readonly string[],
    range: string,
    options?: { loose?: boolean; includePrerelease?: boolean },
  ) => string | null;
  export default maxSatisfying;
}

declare module "semver/ranges/valid" {
  const validRange: (
    range: string,
    options?: { loose?: boolean; includePrerelease?: boolean },
  ) => string | null;
  export default validRange;
}

declare module "@marko/compiler/modules" {
  interface MarkoModules {
    cwd: string;
    root: string;
    pkg: unknown;
    require: null | ((id: string) => unknown);
    resolve: null | ((id: string, from?: string) => string);
    tryResolve: null | ((id: string, from?: string) => string | undefined);
  }
  const modules: MarkoModules;
  export default modules;
}

declare module "lasso-package-root" {
  interface RootPackage {
    __dirname: string;
    __filename: string;
    [key: string]: unknown;
  }
  const lassoPackageRoot: {
    getRootPackage(dirname: string): RootPackage | undefined;
    getRootDir(dirname: string): string | undefined;
  };
  export default lassoPackageRoot;
}
