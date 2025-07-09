import path from "path";
import type { Plugin } from "@rollup/browser";
import * as compiler from "@marko/compiler";
import * as translator from "marko/translator";
import runtimeDOM from "marko/dom?raw";
import runtimeHTML from "marko/html?raw";
import runtimeDebugDOM from "marko/debug/dom?raw";
import runtimeDebugHTML from "marko/debug/html?raw";

import { FileSystem } from "./fs";
import type { Workspace } from "../workspace";

const seenFs = new WeakSet<FileSystem>();
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

export interface MarkoPluginOptions {
  ws: Workspace;
  browser: boolean;
}
export function markoPlugin({
  ws: { fs, optimize },
  browser,
}: MarkoPluginOptions): Plugin {
  const output = browser ? "dom" : "html";
  const baseConfig: compiler.Config = {
    output,
    optimize,
    translator,
    stripTypes: true,
    sourceMaps: true,
    cache: compileCache,
    fileSystem: fs as any,
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
  const compiled: Record<
    string,
    {
      code: string;
      map: any;
    }
  > = {};

  if (!seenFs.has(fs)) {
    seenFs.add(fs);
    compileCache.clear();
    compiler.taglib.clearCaches();
  }

  return {
    name: "marko",
    buildStart() {
      for (const file in fs.files) {
        if (file.endsWith(".marko")) {
          const { code, map } = compiler.compileSync(
            fs.files[file],
            file,
            baseConfig,
          );
          compiled[file] = { code, map };
        }
      }
    },
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
        if (suffix === "?hydrate") {
          const compiled = compiler.compileSync(code, id, hydrateConfig);
          return {
            code: compiled.code,
            map: compiled.map,
          };
        }

        return compiled[id];
      }
    },
  };
}
