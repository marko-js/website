import type * as Compiler from "@marko/compiler";
import { version as currentVersion } from "marko/package.json";
import frozenVersions from "./playground-versions.json";

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

/** The Marko version the website is currently built with (selected by default). */
export const DEFAULT_MARKO_VERSION: string = currentVersion;

// Every selectable version — including the current one — is a frozen, pre-built
// artifact under public/playground/versions/<version>/index.js, snapshotted once
// (see scripts/build-playground-version.mjs) and loaded on demand. The website
// build bundles no compiler and never rebuilds these, so its cost stays flat as
// versions accumulate. Each release just snapshots the current version if it
// isn't already present.
export const MARKO_VERSIONS: readonly string[] = [
  currentVersion,
  ...frozenVersions.filter((v) => v !== currentVersion),
];

const cache = new Map<string, Promise<MarkoToolchain>>();

/** Load (and memoize) the toolchain artifact for a version, falling back to the default. */
export function loadMarkoToolchain(version: string): Promise<MarkoToolchain> {
  let toolchain = cache.get(version);
  if (!toolchain) {
    const v = MARKO_VERSIONS.includes(version)
      ? version
      : DEFAULT_MARKO_VERSION;
    toolchain = (
      import(
        /* @vite-ignore */ `${import.meta.env.BASE_URL}playground/versions/${v}/index.js`
      ) as Promise<{ default: MarkoToolchain }>
    ).then((m) => m.default);
    cache.set(version, toolchain);
  }
  return toolchain;
}
