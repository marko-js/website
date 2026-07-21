# Developer Experience

Friction in builds, tests, tooling, or repo workflows. Format and rules: [README.md](README.md).

## Run prettier -w to fix 8 files failing prettier --check on main

`src/util/hasher.ts` › (whole file) | 2026-07-21 | impact:low | effort:low

`prettier --check .` on main reports 8 files with formatting issues (including
`src/util/hasher.ts` and `src/util/workspace/concat-sourcemaps.ts`), so any
future formatting-enforcement CI step or editor-on-save would produce noisy
diffs. Running `pnpm run format` and committing the result would fix it.
Re-verify with `pnpm exec prettier --check .`.
