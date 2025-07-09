import path from "path";
import type { Plugin } from "@rollup/browser";
import * as compiler from "@marko/compiler";
import * as translator from "marko/translator";
import runtimeDOM from "marko/dom?raw";
import runtimeHTML from "marko/html?raw";
import runtimeDebugDOM from "marko/debug/dom?raw";
import runtimeDebugHTML from "marko/debug/html?raw";

import type { Workspace } from "../workspace";

const cache = new Map();
const seenWS = new WeakSet<Workspace>();
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
export function markoPlugin({ ws, browser }: MarkoPluginOptions): Plugin {
  const { fs, optimize } = ws;
  const output = browser ? "dom" : "html";
  const markoFiles = Object.keys(fs.files).filter(isMarkoFile);
  const baseConfig: compiler.Config = {
    cache,
    output,
    optimize,
    translator,
    stripTypes: true,
    sourceMaps: true,
    fileSystem: fs as any,
    optimizeKnownTemplates: markoFiles,
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

  if (!seenWS.has(ws)) {
    seenWS.add(ws);
    cache.clear();
    compiler.taglib.clearCaches();
  }

  return {
    name: "marko",
    buildStart() {
      for (const file of markoFiles) {
        const { code, map } = compiler.compileSync(
          fs.files[file],
          file,
          baseConfig,
        );
        compiled[file] = { code, map };
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

      if (isMarkoFile(id)) {
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

function isMarkoFile(file: string) {
  return file.endsWith(".marko");
}
