import markoModules from "@marko/compiler/modules";
import lassoPackageRoot from "lasso-package-root";
import { resolveSync, type ResolveOptions } from "resolve-sync";

import type { FileSystem } from "./fs";

let currentFS: FileSystem | undefined;

export function setResolveFileSystem(fs: FileSystem) {
  currentFS = fs;
}

// resolve-sync's upward walk stops before probing the root directory's
// node_modules. Rooting resolution at "//" restores that final probe; the
// doubled slash is collapsed on lookups and on the resolved path. Drop once
// resolve-sync probes the root itself.
export const resolveRoot = "//";
export const collapseRoot = (file: string) => file.replace(/^\/\//, "/");

const resolveFS: ResolveOptions["fs"] = {
  isFile: (file) => !!currentFS && collapseRoot(file) in currentFS.files,
  readPkg: (file) => JSON.parse(currentFS!.files[collapseRoot(file)] || ""),
  realpath: collapseRoot,
};

function tryResolve(id: string, from = "/") {
  if (!currentFS) return undefined;
  // `resolveSync` only understands relative and bare specifiers, so an absolute
  // path -- which is what the taglib records for a discovered tag -- has to be
  // looked up directly or it never resolves.
  if (id.startsWith("/")) {
    return id in currentFS.files ? id : undefined;
  }
  try {
    const resolved = resolveSync(id, {
      from: `${from.endsWith("/") ? from : `${from}/`}_`,
      root: resolveRoot,
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
