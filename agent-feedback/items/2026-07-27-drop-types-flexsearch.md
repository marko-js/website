---
type: cleanup
impact: low
effort: low
site: package.json › devDependencies
---

# Drop the deprecated `@types/flexsearch` stub

`@types/flexsearch` is a deprecated stub package, and pnpm prints a deprecation warning on every install. `flexsearch` has shipped its own types since 0.8: its `package.json` declares both `types` and `exports["."].types` as `./index.d.ts`. The only consumer is `src/util/search-worker.ts`, which imports `flexsearch, { type Index }`. Removing the dependency was verified to leave `marko-type-check` reporting no errors in `search-worker.ts`.

Check: `pnpm remove @types/flexsearch && pnpm exec marko-type-check`.
