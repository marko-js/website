import type * as Compiler from "@marko/compiler";
import { version as defaultVersion } from "marko/package.json";

/**
 * Everything the playground needs to compile and run a given Marko version:
 * the compiler, the version's translator, and the raw source of its runtime
 * entrypoints (keyed by the bare specifier the compiled output imports).
 */
export interface MarkoToolchain {
  compiler: typeof Compiler;
  translator: typeof import("marko/translator");
  runtimeModules: Record<string, string>;
}

/** The Marko version the website itself is built with. */
export const DEFAULT_MARKO_VERSION: string = defaultVersion;

// Each version is a separate dynamic import so Vite code-splits it into its own
// chunk at build time. Only the selected version's toolchain is fetched, and
// nothing here pulls a compiler into the initial/server bundle. To add a
// version: install it under an alias (see package.json), drop a module in
// ./versions, and register its loader below.
const loaders: Record<string, () => Promise<{ default: MarkoToolchain }>> = {
  [defaultVersion]: () => import("./versions/default"),
  "6.1.18": () => import("./versions/v6_1_18"),
};

/** Selectable versions, newest config order, default first. */
export const MARKO_VERSIONS: readonly string[] = Object.keys(loaders);

const cache = new Map<string, Promise<MarkoToolchain>>();

/** Load (and memoize) the toolchain for a version, falling back to the default. */
export function loadMarkoToolchain(version: string): Promise<MarkoToolchain> {
  let toolchain = cache.get(version);
  if (!toolchain) {
    const load = loaders[version] ?? loaders[DEFAULT_MARKO_VERSION];
    toolchain = load().then((m) => m.default);
    cache.set(version, toolchain);
  }
  return toolchain;
}
