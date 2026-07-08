import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Plugin } from "vite";

// Gathers the read-only files the in-browser language server needs on its
// virtual disk -- TypeScript's `lib.*.d.ts`, the Marko type definitions and a
// project `tsconfig.json` -- and exposes them as a single virtual module the
// language-server worker seeds at startup.
//
// The keys are the absolute virtual-disk paths the server reads from. The Marko
// type-definition paths must match `@marko/language-server`'s browser
// `project-defaults` (`Project.setDefaultTypePaths`).
const VIRTUAL_ID = "virtual:marko-lsp-assets";

// The website's node_modules (flat install). Resolving package directories from
// here avoids `require.resolve("<pkg>/package.json")`, which fails for packages
// whose `exports` don't expose `./package.json` (eg typescript).
const lspDir = path.dirname(fileURLToPath(import.meta.url));
const nodeModules = path.resolve(lspDir, "../../../node_modules");
const pkgDir = (name: string) => path.join(nodeModules, ...name.split("/"));

// Node builtins the language server (and its bundled deps) import, mapped to the
// worker-local browser stand-ins in `node-shims/`. Applied only inside browser
// (client/worker) bundles so the Node server build keeps the real modules.
//
// `@marko/language-server/browser` itself resolves from node_modules (the
// published `./browser` export); only the Node builtins it reaches for need
// shimming.
const shim = (name: string) => path.join(lspDir, "node-shims", name);
const WORKER_SHIMS: Record<string, string> = {
  fs: shim("fs.ts"),
  "node:fs": shim("fs.ts"),
  "fs/promises": shim("fs-promises.ts"),
  "node:fs/promises": shim("fs-promises.ts"),
  url: shim("url.ts"),
  "node:url": shim("url.ts"),
  module: shim("module.ts"),
  "node:module": shim("module.ts"),
};

// Environments that run in Node (the server/prerender build) and must keep the
// real Node builtins.
const NODE_ENVIRONMENTS = new Set(["ssr", "server", "rsc"]);

/**
 * Resolve the Node builtins the language-server worker touches to browser
 * stand-ins. Registered in the main `plugins` array (which, unlike
 * `worker.plugins`, is applied to worker modules in dev) with an `enforce: pre`
 * `resolveId` hook. The builtins are only shimmed in browser environments so the
 * Node server build keeps the real modules.
 */
export function markoLspResolve(): Plugin {
  return {
    name: "marko-lsp-resolve",
    enforce: "pre",
    resolveId(id) {
      const env = this.environment?.name;
      if (id in WORKER_SHIMS && (!env || !NODE_ENVIRONMENTS.has(env))) {
        return WORKER_SHIMS[id];
      }
    },
  };
}

// Node builtins whose browser shims the pre-bundled `@marko/compiler` needs at
// dependency-optimization time (see `markoLspOptimizeShims`). Only the `fs`
// family: the compiler's taglib finder scans the disk synchronously for sibling
// `.marko` tags, and the optimizer otherwise externalizes `fs` to a stub that
// throws, so discovery silently finds nothing.
const OPTIMIZE_SHIMS: Record<string, string> = {
  fs: shim("fs.ts"),
  "node:fs": shim("fs.ts"),
  "fs/promises": shim("fs-promises.ts"),
  "node:fs/promises": shim("fs-promises.ts"),
};

/**
 * Point the dependency optimizer's Node-builtin resolution at the browser
 * shims. The optimizer (dev pre-bundle) runs before `markoLspResolve`'s
 * `resolveId` hook and externalizes builtins to throwing stubs, so the bundled
 * `@marko/compiler` would otherwise get an empty `fs`. Registered as an
 * `optimizeDeps.rolldownOptions` plugin (client optimizer only, so the Node
 * server build is untouched); the production build has no optimizer and relies
 * on `markoLspResolve` instead. The shared virtual disk survives being bundled
 * into the pre-bundle because it lives on a `globalThis` singleton (see `vfs`).
 */
export function markoLspOptimizeShims() {
  return {
    name: "marko-lsp-optimize-shims",
    resolveId(id: string) {
      return OPTIMIZE_SHIMS[id];
    },
  };
}

export function markoLspAssets(): Plugin {
  return {
    name: "marko-lsp-assets",
    resolveId(id) {
      if (id === VIRTUAL_ID) return "\0" + VIRTUAL_ID;
    },
    load(id) {
      if (id !== "\0" + VIRTUAL_ID) return;
      return `export default ${JSON.stringify(collectAssets())};`;
    },
  };
}

function collectAssets(): Record<string, string> {
  const assets: Record<string, string> = {};

  // Every `lib.*.d.ts` TypeScript ships, seeded at the virtual root so the
  // default-lib resolution (which falls back to `__dirname` === "/") finds them.
  const tsLibDir = path.join(pkgDir("typescript"), "lib");
  for (const entry of fs.readdirSync(tsLibDir)) {
    if (/^lib\..*\.d\.ts$/.test(entry)) {
      assets["/" + entry] = fs.readFileSync(path.join(tsLibDir, entry), "utf8");
    }
  }

  // Marko's own type definitions, laid out under a virtual `node_modules/marko`
  // so relative (`./tags-html`) and bare (`csstype`) references resolve.
  const markoDir = pkgDir("marko");
  assets["/node_modules/marko/index.d.ts"] = fs.readFileSync(
    path.join(markoDir, "index.d.ts"),
    "utf8",
  );
  assets["/node_modules/marko/tags-html.d.ts"] = fs.readFileSync(
    path.join(markoDir, "tags-html.d.ts"),
    "utf8",
  );
  // The core tags (`<let>`, `<const>`, `<effect>`, ...) carry their own
  // `.d.marko` type definitions, which the extractor imports (eg
  // `import("marko/tags/let.d.marko")`). Without them a `<let>` value mistypes
  // as read-only, so seed the whole `tags/` directory.
  const markoTagsDir = path.join(markoDir, "tags");
  for (const entry of fs.readdirSync(markoTagsDir)) {
    if (entry.endsWith(".d.marko")) {
      assets[`/node_modules/marko/tags/${entry}`] = fs.readFileSync(
        path.join(markoTagsDir, entry),
        "utf8",
      );
    }
  }
  // A permissive manifest so both `marko/package.json` (used by the extractor's
  // `.marko` resolution) and arbitrary `marko/tags/*` subpaths resolve.
  assets["/node_modules/marko/package.json"] = JSON.stringify({
    name: "marko",
    types: "index.d.ts",
  });

  // csstype backs Marko's `style`/HTML attribute typings.
  assets["/node_modules/csstype/index.d.ts"] = fs.readFileSync(
    path.join(pkgDir("csstype"), "index.d.ts"),
    "utf8",
  );
  assets["/node_modules/csstype/package.json"] = JSON.stringify({
    name: "csstype",
    types: "index.d.ts",
  });

  // The compiler-internal typing helpers used by the TypeScript extractor output.
  assets["/node_modules/@marko/language-tools/marko.internal.d.ts"] =
    fs.readFileSync(
      path.join(pkgDir("@marko/language-tools"), "marko.internal.d.ts"),
      "utf8",
    );

  assets["/tsconfig.json"] = JSON.stringify({
    compilerOptions: {
      target: "ESNext",
      module: "ESNext",
      moduleResolution: "Bundler",
      lib: ["DOM", "DOM.Iterable", "ESNext"],
      strict: true,
      jsx: "preserve",
      allowJs: true,
      skipLibCheck: true,
    },
    include: [],
  });

  return assets;
}
