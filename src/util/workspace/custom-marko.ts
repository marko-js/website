import gte from "semver/functions/gte";
import { resolveSync, type ResolveOptions } from "resolve-sync";
import path from "path";
import assert from "assert";

import {
  cached,
  loadPackument,
  loadTarball,
  pickVersion,
  type TarballLimits,
  type VersionMeta,
} from "./npm";
import { patchModules } from "./modules-shim";
import { bundledMarko, type MarkoInstance } from "./marko-plugin";

const MIN_MARKO = "6.0.0-0";
const MIN_COMPILER = "5.39.0-0";

const SKIPPED_DEPS = new Set(["csstype", "source-map-support"]);

// resolve-sync cannot reach a root-level /node_modules, so packages are
// mounted one level deep.
const loaderRoot = "/npm";

const RUNTIME_MODULE_FILES: Record<string, string> = {
  "marko/dom": `${loaderRoot}/node_modules/marko/dist/dom.mjs`,
  "marko/html": `${loaderRoot}/node_modules/marko/dist/html.mjs`,
  "marko/debug/dom": `${loaderRoot}/node_modules/marko/dist/debug/dom.mjs`,
  "marko/debug/html": `${loaderRoot}/node_modules/marko/dist/debug/html.mjs`,
};

// dist/babel.js (node-only Babel build) and register.js (node require hook)
// are excluded; the browser export condition selects dist/babel.web.js.
const compilerFiles =
  /^\/(?:package\.json$|modules\.js$|dist\/(?!babel\.js$|register\.js$).*(?<!\.d)\.(?:[cm]?js|json)$)/;
const markoFiles = /^\/(?:package\.json$|dist\/.*(?<!\.d)\.(?:[cm]?js|json)$)/;
const depFiles = /(?<!\.d)\.(?:[cm]?js|json)$/;

const loaderLimits: TarballLimits = {
  maxFileSize: 4 * 1024 * 1024,
  maxPackageSize: 24 * 1024 * 1024,
};

const instanceCache = new Map<string, Promise<MarkoInstance>>();

export async function getMarkoInstance(
  packageJsonSource: string,
): Promise<MarkoInstance> {
  let deps: Record<string, string>;
  try {
    const pkg = JSON.parse(packageJsonSource);
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
      `The playground can only load marko 6.0.0 and newer (requested ${markoVersion}). Remove "marko" from package.json to use the bundled version (${bundledMarko.markoVersion}).`,
    );
  }
  if (!gte(compilerVersion, MIN_COMPILER)) {
    throw new Error(
      `The playground can only load @marko/compiler 5.39.0 and newer (requested ${compilerVersion}). Remove "@marko/compiler" from package.json to use the bundled version (${bundledMarko.compilerVersion}).`,
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
  limits?: TarballLimits,
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

function createRequire(files: Record<string, string>) {
  const moduleCache = new Map<string, { exports: any }>();
  const resolveFS: ResolveOptions["fs"] = {
    isFile: (file) => file in files,
    readPkg: (file) => JSON.parse(files[file] || ""),
  };
  const builtins: Record<string, unknown> = {
    // The compiler reads files through its fileSystem config, never fs.
    fs: {},
    path,
    assert,
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
