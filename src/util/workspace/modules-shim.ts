import markoModules from "@marko/compiler/modules";
import lassoPackageRoot from "lasso-package-root";
import { resolveSync, type ResolveOptions } from "resolve-sync";

import type { FileSystem } from "./fs";

let currentFS: FileSystem | undefined;

export function setResolveFileSystem(fs: FileSystem) {
  currentFS = fs;
}

// `resolveSync` stops its upward walk just before probing the resolution root,
// so with the workspace mounted at "/" the top-level `node_modules` would never
// be consulted. A root no directory ever equals lets the walk continue through
// "/" until resolve-sync's own `parent === dir` guard stops it, which is
// Node's algorithm: every `node_modules` up to and including "/" gets probed.
const resolveRoot = "\0";

// The probe at "/" concatenates a doubled leading slash ("//node_modules/..."),
// which the file map's exact-string lookups would miss. Collapsing it in the fs
// shim makes the probe hit, and doing the same in `realpath` keeps the paths
// handed back to callers canonical.
function collapse(file: string) {
  return file[0] === "/" && file[1] === "/" ? file.slice(1) : file;
}

const resolveFS: ResolveOptions["fs"] = {
  isFile(file: string) {
    return !!currentFS && collapse(file) in currentFS.files;
  },
  readPkg(file: string) {
    return JSON.parse(currentFS!.files[collapse(file)] || "");
  },
  realpath: collapse,
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
