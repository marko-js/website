import markoModules from "@marko/compiler/modules";
import lassoPackageRoot from "lasso-package-root";
import { resolveSync, type ResolveOptions } from "resolve-sync";

import type { FileSystem } from "./fs";

let currentFS: FileSystem | undefined;

export function setResolveFileSystem(fs: FileSystem) {
  currentFS = fs;
}

// `resolveSync` joins paths with plain string concatenation, so resolving a
// bare specifier from the workspace root produces `//node_modules/...`. A real
// filesystem collapses the duplicate slash; the virtual file map keys are
// exact strings, so it has to be collapsed here or nothing under
// `node_modules` ever resolves.
function normalize(file: string) {
  return file.replace(/\/{2,}/g, "/");
}

const resolveFS: ResolveOptions["fs"] = {
  isFile(file: string) {
    return !!currentFS && normalize(file) in currentFS.files;
  },
  readPkg(file: string) {
    return JSON.parse(currentFS!.files[normalize(file)] || "");
  },
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
      silent: true,
      fs: resolveFS,
    });
    return typeof resolved === "string" ? normalize(resolved) : undefined;
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
