import path from "path";
import type { Plugin } from "@rollup/browser";
import * as compiler from "@marko/compiler";
import * as translator from "marko/translator";

import type { BuildContext } from "../build.ts";
import { attachErrorFile } from "../compile-error.ts";
import { rootDir } from "./fs.ts";
import { setResolveFileSystem } from "./modules-shim.ts";

export interface MarkoCompiled {
  dom?: Record<string, { code: string; map: any }>;
  html?: Record<string, { code: string; map: any }>;
}

const cache = new Map();
const knownTemplatesForWS = new WeakMap<BuildContext, string[]>();

// Map a runtime import onto the captured dist files: a bare specifier like
// `marko/dom` or `marko/dom/controllable-input.feat` gets its `.mjs`
// appended, and a chunk import (`./dom-Cj4HQ7T_.mjs`) is joined against the
// importing runtime module's id.
function resolveRuntimeModule(
  runtimeFiles: Record<string, string>,
  id: string,
  importer?: string,
) {
  if (id[0] === ".") {
    if (!(importer && importer in runtimeFiles)) return;
    id = path.join(importer, "..", id);
  } else if (!id.startsWith("marko/")) {
    return;
  }
  if (id in runtimeFiles) return id;
  const withExtension = `${id}.mjs`;
  if (withExtension in runtimeFiles) return withExtension;
}

// Shim currently needed because @marko/compiler uses `lasso-package-root`.
// Node already has a real `process`, so only a browser needs the stand-in.
if (typeof process === "undefined" || !process.versions?.node) {
  (globalThis as any).process = {
    browser: true,
    env: {
      NODE_ENV: "production",
    },
    cwd() {
      return rootDir;
    },
  };
}

export interface MarkoPluginOptions {
  ws: BuildContext;
  browser: boolean;
  runtimeFiles: Record<string, string>;
}
export function markoPlugin({
  ws,
  browser,
  runtimeFiles,
}: MarkoPluginOptions): Plugin {
  const { fs, optimize } = ws;
  setResolveFileSystem(fs);
  let optimizeKnownTemplates = knownTemplatesForWS.get(ws);
  if (!optimizeKnownTemplates) {
    cache.clear();
    compiler.taglib.clearCaches();
    optimizeKnownTemplates = [];
    for (const file in fs.files) {
      if (isMarkoFile(file)) {
        optimizeKnownTemplates.push(file);
      }
    }
    knownTemplatesForWS.set(ws, optimizeKnownTemplates);
  }

  const output = browser ? "dom" : "html";
  const baseConfig: compiler.Config = {
    cache,
    output,
    optimize,
    translator,
    stripTypes: true,
    sourceMaps: true,
    fileSystem: fs as any,
    optimizeKnownTemplates,
    resolveVirtualDependency(from, { virtualPath, code, map }) {
      const resolved = path.join(from, "..", virtualPath);
      fs.files[resolved] = code;
      if (map) {
        fs.files[resolved + ".map"] = JSON.stringify(map);
      }
      return virtualPath;
    },
  };
  const hydrateConfig: compiler.Config = { ...baseConfig, output: "hydrate" };
  const compiled = ((ws.markoCompiled ??= {})[output] ??= {});
  const compileFile = (source: string, file: string) => {
    try {
      const { code, map } = compiler.compileSync(source, file, baseConfig);
      return (compiled[file] = { code, map });
    } catch (err) {
      throw attachErrorFile(err, file);
    }
  };

  for (const file of optimizeKnownTemplates) {
    if (!file.includes("/node_modules/")) {
      compileFile(fs.files[file], file);
    }
  }

  return {
    name: "marko",
    resolveId(id, importer) {
      const tagName = importer && /^<([^>]+)>$/.exec(id)?.[1];
      if (tagName) {
        // Rebound per hook since a newer workspace build may have pointed the
        // shared resolver at its own file system in the meantime.
        setResolveFileSystem(fs);
        const tagDef = compiler.taglib
          .buildLookup(importer.slice(0, importer.lastIndexOf("/")))
          .getTag(tagName);
        return tagDef && (tagDef.template || tagDef.renderer);
      }
      return resolveRuntimeModule(runtimeFiles, id, importer);
    },
    load(id) {
      return runtimeFiles[id];
    },
    transform(code, id) {
      const suffix = /\?.*$/.exec(id)?.[0];
      if (suffix) {
        id = id.slice(0, -suffix.length);
      }

      if (isMarkoFile(id)) {
        setResolveFileSystem(fs);
        if (suffix === "?hydrate") {
          const compiled = compiler.compileSync(code, id, hydrateConfig);
          return {
            code: compiled.code,
            map: compiled.map,
          };
        }

        return compiled[id] || compileFile(code, id);
      }
    },
  };
}

function isMarkoFile(file: string) {
  return file.endsWith(".marko");
}
