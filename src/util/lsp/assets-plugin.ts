import fs from "node:fs";
import { createRequire } from "node:module";
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

const lspDir = path.dirname(fileURLToPath(import.meta.url));

/**
 * Directory an installed package lives in. Resolved through Node rather than
 * joined onto a `node_modules` path: pnpm only links direct dependencies at the
 * top level, so a transitive package is reachable only from the dependent that
 * pulls it in (pass that package's directory as `from`).
 */
function pkgDir(name: string, from = lspDir): string {
  const { resolve } = createRequire(path.join(from, "index.js"));
  try {
    return path.dirname(resolve(`${name}/package.json`));
  } catch {
    // Packages whose `exports` hide `./package.json` (eg typescript): walk up
    // from the resolved entry point until the manifest turns up.
    let dir = path.dirname(resolve(name));
    for (;;) {
      if (fs.existsSync(path.join(dir, "package.json"))) return dir;
      const parent = path.dirname(dir);
      if (parent === dir) throw new Error(`cannot locate package "${name}"`);
      dir = parent;
    }
  }
}

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

/**
 * Point the dependency optimizer's Node-builtin resolution at the same browser
 * shims. The optimizer (dev pre-bundle) runs before `markoLspResolve`'s
 * `resolveId` hook and externalizes builtins to stubs that throw on use, so a
 * pre-bundled language server would get an empty `fs` for the compiler's taglib
 * scan and a `url` whose `fileURLToPath` is not a function. Registered as an
 * `optimizeDeps.rolldownOptions` plugin (client optimizer only, so the Node
 * server build is untouched); the production build has no optimizer and relies
 * on `markoLspResolve` instead. The shared virtual disk survives being bundled
 * into the pre-bundle because it lives on a `globalThis` singleton (see `vfs`).
 */
export function markoLspOptimizeShims() {
  return {
    name: "marko-lsp-optimize-shims",
    resolveId(id: string) {
      return WORKER_SHIMS[id];
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
      return `export default ${assetsModule()};`;
    },
  };
}

// The seed is a few megabytes of `.d.ts` read off disk, and the plugin is
// registered for both the worker and the client graph, so the serialized module
// is built once per process rather than per load.
let serializedAssets: string | undefined;
function assetsModule(): string {
  return (serializedAssets ??= JSON.stringify(collectAssets()));
}

function collectAssets(): Record<string, string> {
  const assets: Record<string, string> = {};

  collectLibs(assets);

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

  // csstype backs Marko's `style`/HTML attribute typings. It is marko's
  // dependency, not the website's, so it resolves from marko's directory.
  assets["/node_modules/csstype/index.d.ts"] = fs.readFileSync(
    path.join(pkgDir("csstype", markoDir), "index.d.ts"),
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

  assets["/tsconfig.json"] = JSON.stringify(TSCONFIG);

  return assets;
}

// The project the language server type-checks. Its `lib` list is also what
// decides which of TypeScript's `lib.*.d.ts` files reach the worker.
const TSCONFIG = {
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
};

// What TypeScript reaches for when a program asks for the default lib rather
// than the configured one, so it is seeded alongside the declared libs.
const DEFAULT_LIB = "esnext.full";

/**
 * Seed the `lib.*.d.ts` files the project can actually reach: the ones its
 * `lib` setting names, plus everything those pull in through
 * `/// <reference lib="..." />`. TypeScript ships libs for every target and
 * host it supports, and the unreachable ones (`webworker`, `scripthost`, the
 * older `*.full` entry points) are close to a megabyte of dead weight in the
 * worker bundle.
 *
 * They sit at the virtual root because default-lib resolution falls back to
 * `__dirname`, which is "/" on the virtual disk.
 */
function collectLibs(assets: Record<string, string>): void {
  const tsLibDir = path.join(pkgDir("typescript"), "lib");
  const pending = [
    ...TSCONFIG.compilerOptions.lib.map((lib) => lib.toLowerCase()),
    DEFAULT_LIB,
  ];
  const seen = new Set<string>();

  while (pending.length) {
    const name = pending.pop()!;
    if (seen.has(name)) continue;
    seen.add(name);

    const entry = `lib.${name}.d.ts`;
    let content;
    try {
      content = fs.readFileSync(path.join(tsLibDir, entry), "utf8");
    } catch {
      continue; // A reference to a lib this TypeScript version does not ship.
    }

    assets["/" + entry] = content;
    for (const [, ref] of content.matchAll(/<reference lib="([^"]+)"/g)) {
      pending.push(ref);
    }
  }
}
