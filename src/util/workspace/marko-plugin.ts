import path from "path";
import type { Plugin } from "@rollup/browser";
import * as compiler from "@marko/compiler";
import { version as compilerVersion } from "@marko/compiler/package.json";
import * as translator from "marko/translator";
import { version as markoVersion } from "marko/package.json";
import runtimeDOM from "marko/dom?raw";
import runtimeHTML from "marko/html?raw";
import runtimeDebugDOM from "marko/debug/dom?raw";
import runtimeDebugHTML from "marko/debug/html?raw";

import type { Workspace } from "../workspace";
import { setResolveFileSystem } from "./modules-shim";

declare module "../workspace" {
  interface Workspace {
    markoCompiled?: {
      dom?: Record<string, { code: string; map: any }>;
      html?: Record<string, { code: string; map: any }>;
    };
  }
}

// A compiler + translator + runtime set the playground can build with. The
// bundled instance ships with the site; alternates are loaded on demand when
// package.json pins a different version (see custom-marko.ts).
export interface MarkoInstance {
  compiler: typeof compiler;
  translator: compiler.Config["translator"];
  runtimeModules: Record<string, string>;
  compileCache: Map<unknown, unknown>;
  markoVersion: string;
  compilerVersion: string;
}

export const bundledMarko: MarkoInstance = {
  compiler,
  translator,
  runtimeModules: {
    "marko/dom": runtimeDOM,
    "marko/html": runtimeHTML,
    "marko/debug/dom": runtimeDebugDOM,
    "marko/debug/html": runtimeDebugHTML,
  },
  compileCache: new Map(),
  markoVersion,
  compilerVersion,
};

const knownTemplatesForWS = new WeakMap<Workspace, string[]>();

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
  marko?: MarkoInstance;
}
export function markoPlugin({
  ws,
  browser,
  marko = bundledMarko,
}: MarkoPluginOptions): Plugin {
  const { fs, optimize } = ws;
  const { compiler, translator, runtimeModules, compileCache } = marko;
  setResolveFileSystem(fs);
  let optimizeKnownTemplates = knownTemplatesForWS.get(ws);
  if (!optimizeKnownTemplates) {
    compileCache.clear();
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
    cache: compileCache,
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
    const { code, map } = compiler.compileSync(source, file, baseConfig);
    return (compiled[file] = { code, map });
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
