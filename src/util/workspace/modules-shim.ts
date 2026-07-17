import markoModules from "@marko/compiler/modules";
import lassoPackageRoot from "lasso-package-root";
import { resolveSync, type ResolveOptions } from "resolve-sync";

import type { FileSystem } from "./fs";

let currentFS: FileSystem | undefined;

export function setResolveFileSystem(fs: FileSystem) {
  currentFS = fs;
}

const resolveFS: ResolveOptions["fs"] = {
  isFile(file: string) {
    return !!currentFS && file in currentFS.files;
  },
  readPkg(file: string) {
    return JSON.parse(currentFS!.files[file] || "");
  },
};

function tryResolve(id: string, from = "/") {
  if (!currentFS) return undefined;
  try {
    const resolved = resolveSync(id, {
      from: `${from.endsWith("/") ? from : `${from}/`}_`,
      silent: true,
      fs: resolveFS,
    });
    return typeof resolved === "string" ? resolved : undefined;
  } catch {
    return undefined;
  }
}

markoModules.cwd = "/";
markoModules.root = "/";
markoModules.tryResolve = tryResolve;
markoModules.resolve = (id, from) => {
  const resolved = tryResolve(id, from);
  if (!resolved) {
    throw new Error(`Cannot resolve module "${id}"`);
  }
  return resolved;
};
markoModules.require = (id) => {
  throw new Error(
    `Loading taglib JS modules is not supported in the playground: "${id}"`,
  );
};

lassoPackageRoot.getRootPackage = (dirname) => {
  if (!currentFS) return undefined;
  let dir = dirname;
  while (true) {
    const packagePath = dir === "/" ? "/package.json" : `${dir}/package.json`;
    if (packagePath in currentFS.files) {
      let pkg;
      try {
        pkg = JSON.parse(currentFS.files[packagePath]);
      } catch {
        pkg = undefined;
      }

      if (
        pkg &&
        (pkg.name ||
          pkg.version ||
          pkg.dependencies ||
          pkg.devDependencies ||
          pkg.peerDependencies)
      ) {
        pkg.__dirname = dir;
        return pkg;
      }
    }

    if (dir === "/") return undefined;
    dir = dir.slice(0, dir.lastIndexOf("/")) || "/";
  }
};
