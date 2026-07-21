import gte from "semver/functions/gte";
import { resolveSync, type ResolveOptions } from "resolve-sync";
import path from "path";
import assert from "assert";

import {
  cached,
  loadPackument,
  loadTarball,
  pickVersion,
  type VersionMeta,
} from "./npm";
import { patchModules } from "./modules-shim";
import { bundledMarko, type MarkoInstance } from "./marko-plugin";

// Overriding to versions older than these is unsupported: the playground
// drives the compiler through APIs (fileSystem, optimizeKnownTemplates,
// marko/translator) that first stabilized in these releases.
const MIN_MARKO = "6.0.0-0";
const MIN_COMPILER = "5.39.0-0";

// Loaded lazily by entrypoints the playground never evaluates (register.js),
// or type-only, so their tarballs are never needed.
const SKIPPED_DEPS = new Set(["csstype", "source-map-support"]);

// resolve-sync never reaches a root-level /node_modules (the parent walk
// stops at "/"), so loader packages are mounted one level deep.
const loaderRoot = "/npm";

const RUNTIME_MODULE_FILES: Record<string, string> = {
  "marko/dom": `${loaderRoot}/node_modules/marko/dist/dom.mjs`,
  "marko/html": `${loaderRoot}/node_modules/marko/dist/html.mjs`,
  "marko/debug/dom": `${loaderRoot}/node_modules/marko/dist/debug/dom.mjs`,
  "marko/debug/html": `${loaderRoot}/node_modules/marko/dist/debug/html.mjs`,
};

// dist/babel.js is the node-only Babel build (the browser condition selects
// babel.web.js) and register.js is a node require hook; both are excluded so
// they aren't kept in memory.
const compilerFiles =
  /^\/(?:package\.json$|modules\.js$|dist\/(?!babel\.js$|register\.js$).*(?<!\.d)\.(?:[cm]?js|json)$)/;
const markoFiles = /^\/(?:package\.json$|dist\/.*(?<!\.d)\.(?:[cm]?js|json)$)/;
const depFiles = /^\/(?:.*(?<!\.d)\.(?:[cm]?js|json)$)/;

// babel.web.js is ~2MB in a single file.
const loaderLimits = {
  maxFileSize: 4 * 1024 * 1024,
  maxPackageSize: 24 * 1024 * 1024,
};

const instanceCache = new Map<string, Promise<MarkoInstance>>();

/**
 * Returns the marko compiler/translator/runtime set a workspace build should
 * use. When package.json pins `marko` (or `@marko/compiler`) to something
 * other than the versions bundled with the site, the requested versions are
 * downloaded from npm and evaluated in the browser.
 */
export async function getMarkoInstance(
  packageJsonSource: string | undefined,
): Promise<MarkoInstance> {
  let deps: Record<string, string>;
  try {
    const pkg = JSON.parse(packageJsonSource || "{}");
    deps = {
      ...pkg.peerDependencies,
      ...pkg.devDependencies,
      ...pkg.dependencies,
    };
  } catch {
    // fetchNodeModules reports invalid package.json.
    return bundledMarko;
  }

  const markoRange = deps.marko;
  const compilerRange = deps["@marko/compiler"];
  if (markoRange === undefined && compilerRange === undefined) {
    return bundledMarko;
  }

  const markoPackument = await loadPackument("marko");
  const markoVersion = markoRange
    ? pickVersion("marko", markoRange, markoPackument)
    : bundledMarko.markoVersion;
  const markoMeta = markoPackument.versions[markoVersion];
  const compilerPackument = await loadPackument("@marko/compiler");
  const compilerVersion = pickVersion(
    "@marko/compiler",
    compilerRange ||
      markoMeta?.dependencies?.["@marko/compiler"] ||
      bundledMarko.compilerVersion,
    compilerPackument,
  );

  if (
    markoVersion === bundledMarko.markoVersion &&
    compilerVersion === bundledMarko.compilerVersion
  ) {
    return bundledMarko;
  }

  if (!gte(markoVersion, MIN_MARKO)) {
    throw new Error(
      `The playground cannot load marko@${markoVersion}; only ${MIN_MARKO.slice(0, -2)} and newer can be loaded. Remove "marko" from package.json to use the bundled version (${bundledMarko.markoVersion}).`,
    );
  }
  if (!gte(compilerVersion, MIN_COMPILER)) {
    throw new Error(
      `The playground cannot load @marko/compiler@${compilerVersion}; only ${MIN_COMPILER.slice(0, -2)} and newer can be loaded. Remove "@marko/compiler" from package.json to use the bundled version (${bundledMarko.compilerVersion}).`,
    );
  }

  return cached(instanceCache, `${markoVersion}+${compilerVersion}`, () =>
    loadInstance(markoMeta, compilerPackument.versions[compilerVersion]),
  );
}

async function loadInstance(
  markoMeta: VersionMeta,
  compilerMeta: VersionMeta,
): Promise<MarkoInstance> {
  const files: Record<string, string> = {};
  const seen = new Set(["marko", "@marko/compiler", ...SKIPPED_DEPS]);
  await Promise.all([
    addPackage(files, "marko", markoMeta, markoFiles, loaderLimits),
    addPackage(
      files,
      "@marko/compiler",
      compilerMeta,
      compilerFiles,
      loaderLimits,
    ),
    addDependencies(files, markoMeta, seen),
    addDependencies(files, compilerMeta, seen),
  ]);

  const runtimeModules: Record<string, string> = {};
  for (const id in RUNTIME_MODULE_FILES) {
    const code = files[RUNTIME_MODULE_FILES[id]];
    if (!code) {
      throw new Error(
        `marko@${markoMeta.version} does not include the "${id}" runtime the playground expects.`,
      );
    }
    runtimeModules[id] = code;
  }

  const require = createRequire(files);
  patchModules(
    require("@marko/compiler/modules"),
    require("lasso-package-root"),
  );

  return {
    compiler: require("@marko/compiler"),
    translator: require("marko/translator"),
    runtimeModules,
    compileCache: new Map(),
    markoVersion: markoMeta.version,
    compilerVersion: compilerMeta.version,
  };
}

async function addPackage(
  files: Record<string, string>,
  name: string,
  meta: VersionMeta,
  filter: RegExp,
  limits?: { maxFileSize: number; maxPackageSize: number },
) {
  const pkgFiles = await loadTarball(name, meta, filter, limits);
  for (const file in pkgFiles) {
    files[`${loaderRoot}/node_modules/${name}${file}`] = pkgFiles[file];
  }
}

async function addDependencies(
  files: Record<string, string>,
  meta: VersionMeta,
  seen: Set<string>,
): Promise<void> {
  await Promise.all(
    Object.entries(meta.dependencies || {}).map(async ([name, range]) => {
      if (seen.has(name)) return;
      seen.add(name);
      const packument = await loadPackument(name);
      const depMeta = packument.versions[pickVersion(name, range, packument)];
      await Promise.all([
        addPackage(files, name, depMeta, depFiles),
        addDependencies(files, depMeta, seen),
      ]);
    }),
  );
}

/**
 * A small CommonJS loader over the in-memory package files, used to evaluate
 * the downloaded compiler and translator in the browser.
 */
function createRequire(files: Record<string, string>) {
  const moduleCache = new Map<string, { exports: any }>();
  const resolveFS: ResolveOptions["fs"] = {
    isFile: (file) => file in files,
    readPkg: (file) => JSON.parse(files[file] || ""),
  };
  const builtins: Record<string, unknown> = {
    // The compiler only touches fs through its injectable fileSystem config,
    // which the playground always provides.
    fs: {},
    path,
    assert,
    // Only reached when a browserslist target is configured, which the
    // playground never does.
    browserslist: () => [],
  };

  const requireFrom = (id: string, from: string): any => {
    if (id.startsWith("node:")) {
      id = id.slice(5);
    }
    if (id in builtins) {
      return builtins[id];
    }

    const resolved = resolveSync(id, {
      from,
      fs: resolveFS,
      browser: true,
      require: true,
      fields: ["browser", "main"],
      exts: [".js", ".cjs", ".json"],
    });
    if (typeof resolved !== "string") {
      throw new Error(`Cannot resolve "${id}" from "${from}"`);
    }

    let mod = moduleCache.get(resolved);
    if (!mod) {
      mod = { exports: {} };
      moduleCache.set(resolved, mod);
      const source = files[resolved];
      if (resolved.endsWith(".json")) {
        mod.exports = JSON.parse(source);
      } else {
        const wrapper = new Function(
          "exports",
          "require",
          "module",
          "__filename",
          "__dirname",
          `${source}\n//# sourceURL=playground-package:/${resolved}`,
        );
        wrapper(
          mod.exports,
          (dep: string) => requireFrom(dep, resolved),
          mod,
          resolved,
          resolved.slice(0, resolved.lastIndexOf("/")),
        );
      }
    }

    return mod.exports;
  };

  return (id: string) => requireFrom(id, `${loaderRoot}/_`);
}
