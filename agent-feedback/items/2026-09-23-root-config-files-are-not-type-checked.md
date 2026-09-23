---
type: dx
impact: low
effort: low
site: tsconfig.json › include
---

# Type-check the config files at the repo root

`tsconfig.json` limits `include` to `src/**/*`, so `vitest.config.ts`, `vite.config.ts` and `postcss.config.js` are checked by nothing and `pnpm run type-check` passes whatever they contain. Those files carry real logic — `vite.config.ts` builds the plugin chain and `vitest.config.ts` imports a plugin out of `src/util` — and they are also the only files relying on `allowImportingTsExtensions`, which Vite's native config loader forces, so the one option nothing verifies is the one they depend on. A second tsconfig covering the root configs, wired into the `type-check` script, would close it.

Check: append `const broken: number = "nope";` to `vitest.config.ts` and `pnpm run type-check` still exits 0.
