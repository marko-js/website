import markoModules from "@marko/compiler/modules";
import lassoPackageRoot from "lasso-package-root";
import { resolveSync, type ResolveOptions } from "resolve-sync";

import type { FileSystem } from "./fs";

let currentFS: FileSystem | undefined;

export function setResolveFileSystem(fs: FileSystem) {
  currentFS = fs;
}

// `resolveSync`'s upward walk never probes the root directory itself: from a
// root-level file it builds "//node_modules/..." (which an exact-match file
// map misses), and from a nested file the walk stops the moment it reaches
// the root. Rooting resolution at "//" keeps the walk alive for one final
// probe of "//node_modules/...", and collapsing the doubled slash maps that
// probe back onto the real "/"-keyed files. Drop both once resolve-sync
// probes the root directory's node_modules.
export const resolveRoot = "//";
export const collapseResolveRoot = (file: string) =>
  file.replace(/^\/{2,}/, "/");

const resolveFS: ResolveOptions["fs"] = {
  isFile(file: string) {
    return !!currentFS && collapseResolveRoot(file) in currentFS.files;
  },
  readPkg(file: string) {
    return JSON.parse(currentFS!.files[collapseResolveRoot(file)] || "");
  },
  realpath: collapseResolveRoot,
};

function tryResolve(id: string, from = "/") {
  if (!currentFS) return undefined;
  // `resolveSync` only understands relative and bare specifiers, so an absolute
  // path -- which is what the taglib records for a discovered tag -- has to be
  // looked up directly or it never resolves.
  if (id.startsWith("/")) {
    const file = collapseResolveRoot(id);
    return file in currentFS.files ? file : undefined;
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
