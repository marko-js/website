import path from "path";
import type { Plugin } from "@rollup/browser";
import * as compiler from "@marko/compiler";
import * as translator from "marko/translator";
import runtimeDOM from "marko/dom?raw";
import runtimeHTML from "marko/html?raw";
import runtimeDebugDOM from "marko/debug/dom?raw";
import runtimeDebugHTML from "marko/debug/html?raw";

import fs, { getFiles, onChange } from "./fs";

const compileCache = new Map();
const runtimeModules: Record<string, string> = {
  "marko/dom": runtimeDOM,
  "marko/html": runtimeHTML,
  "marko/debug/dom": runtimeDebugDOM,
  "marko/debug/html": runtimeDebugHTML,
};

// Shim currently needed because @marko/compiler uses `lasso-package-root`.
(globalThis as any).process = {
  browser: true,
  env: {
    NODE_ENV: "production",
  },
  cwd() {
    return "/";
  },
};

compiler.configure({
  translator,
  fileSystem: fs,
  stripTypes: true,
  sourceMaps: true,
  cache: compileCache,
  resolveVirtualDependency(from, { virtualPath, code, map }) {
    const files = getFiles();
    const resolved = path.join(from, "..", virtualPath);
    files[resolved] = code;
    if (map) {
      files[resolved + ".map"] = JSON.stringify(map);
    }
    return virtualPath;
  },
});

export function markoPlugin(config: compiler.Config): Plugin {
  const hydrateConfig: compiler.Config = { ...config, output: "hydrate" };
  return {
    name: "marko",
    resolveId(id) {
      if (id in runtimeModules) {
        return id;
      }
    },
    load(id) {
      return runtimeModules[id];
    },
    transform(code, id) {
      const suffix = /\?.*$/.exec(id)?.[0];
      if (suffix) {
        id = id.slice(0, -suffix.length);
      }

      if (id.endsWith(".marko")) {
        const compiled = compiler.compileSync(
          code,
          id,
          suffix === "?hydrate" ? hydrateConfig : config,
        );
        return {
          code: compiled.code,
          map: compiled.map,
        };
      }
    },
  };
}

onChange(() => {
  compileCache.clear();
  compiler.taglib.clearCaches();
});
