# Developer Experience

Friction in builds, tests, tooling, or repo workflows. Format and rules: [README.md](README.md).

## Run prettier -w to fix 8 files failing prettier --check on main

`src/util/hasher.ts` › (whole file) | 2026-07-21 | impact:low | effort:low

`prettier --check .` on main reports 8 files with formatting issues (including
`src/util/hasher.ts` and `src/util/workspace/concat-sourcemaps.ts`), so any
future formatting-enforcement CI step or editor-on-save would produce noisy
diffs. Running `pnpm run format` and committing the result would fix it.
Re-verify with `pnpm exec prettier --check .`.

The count is now 7 files, unchanged by the prettier 3.9.5 to 3.9.6 bump: both
versions produce byte-identical output for these files, so the drift predates
either version rather than tracking a formatting change.

## Wire `marko-type-check` into a script and CI, or record why it is not gated

`package.json` › `scripts` | 2026-07-27 | impact:med | effort:med

`@marko/type-check` is a devDependency but no `package.json` script invokes it
and `.github/workflows/ci.yml` runs only `pnpm install --frozen-lockfile` and
`pnpm run build`, so nothing catches type regressions. Running
`pnpm exec marko-type-check` on main reports 66 errors: 63 in generated
`src/routes/docs/_compiled-docs/**` pages (TS2322 on code samples lifted from
the markdown docs) and 3 in hand-written source. The three are
`src/util/sizes.ts` › `streamToGzipByteLength` (TS2345, `CompressionStream` vs
`ReadableWritablePair<Uint8Array>`), `src/util/workspace.ts` (TS2540, assigning
to a read-only `Console` method), and the playground `editor.marko`
`<lifecycle>` object, whose type parameter declares `listener` as required but
only assigns it in `onMount`. Gating is only useful once the generated-docs
errors are suppressed or fixed, so the first step is deciding whether
`_compiled-docs` should be type-checked at all. Re-verify with
`pnpm run build && pnpm exec marko-type-check`.
