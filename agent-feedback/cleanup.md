# Cleanup

Duplication, dead code, inconsistencies, refactor opportunities. Format and rules: [README.md](README.md).

## Drop the deprecated `@types/flexsearch` stub

`package.json` › `devDependencies` | 2026-07-27 | impact:low | effort:low

`@types/flexsearch` is a deprecated stub package, and pnpm prints a deprecation
warning on every install. `flexsearch` has shipped its own types since 0.8: its
`package.json` declares both `types` and `exports["."].types` as `./index.d.ts`.
The only consumer is `src/util/search-worker.ts`, which imports
`flexsearch, { type Index }`. Removing the dependency was verified to leave
`marko-type-check` reporting no errors in `search-worker.ts`. Re-verify with
`pnpm remove @types/flexsearch && pnpm exec marko-type-check`.

## Fill in the three docs that have no usable opening prose

`docs/explanation/optimizing-performance.md` › `# Optimizing Performance` | 2026-07-28 | impact:med | effort:med

`optimizing-performance.md` and `docs/guide/publishing-components.md` are
heading-only stubs with no body text at all, and `docs/guide/library-integration.md`
opens its first section with the bare fragment "Use `<lifecycle>` tag" instead of
a sentence. Beyond the reader-facing gap, the build derives each page's
`<meta name=description>` from its opening paragraph, so the two stubs fall back
to the generic site description and library-integration advertises itself to
search engines as "Use <lifecycle> tag". Writing an intro paragraph for each
fixes both at once. Re-verify with `npm run build` and then
`grep -h '"description"' src/routes/docs/_compiled-docs/{explanation/optimizing-performance,guide/publishing-components,guide/library-integration}+meta.json`.

## Remove the empty token-type branch in the markodown walker

`src/util/markodown.ts` › `markoDocs` | 2026-07-29 | impact:low | effort:low

Inside `markoDocs()`'s `walkTokens`, after the code-fence handling there is a
chain that begins `if (token.type === "code" && token.lang === "marko") {}`
with an empty body, followed by an `else if (token.type === "codespan")`
branch whose only content is a commented-out line. Only the final
`else if (token.type === "link")` branch does anything. The two dead branches
read as if they carry behavior and slow down anyone tracing how tokens are
transformed; collapsing the chain to a single `if (token.type === "link")`
preserves behavior. Re-verify by reading the chain and running `pnpm test`.

## Drop the `//` resolution-root workaround once resolve-sync probes the root

`src/util/workspace/modules-shim.ts` › `resolveRoot` | 2026-08-03 | impact:low | effort:low

`modules-shim.ts` and `main-plugin.ts` pass `root: "//"` to `resolveSync` and collapse leading doubled slashes in their `fs` adapters so the resolver's upward walk gets one extra iteration that probes the root-level `node_modules` (its walk otherwise builds `//node_modules/...` from root files and stops before the root from nested files, which broke every playground `package.json` dependency after the workspace remounted at `/`). This rides on resolve-sync internals: the walk terminates only via the `parent === dir` guard added in 1.2.1, so the dependency must stay `>=1.2.1`. Once `resolve-sync` itself probes the root directory's `node_modules`, delete `resolveRoot`/`collapseResolveRoot`, the `root:` options, and the `realpath` shims, keeping the plain `file in fs.files` adapters. Re-verify after removal with `npx vitest run src/util/workspace/modules-shim.test.ts`, which pins the behavior either way.
