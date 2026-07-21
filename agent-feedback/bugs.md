# Suspected Bugs

Out-of-scope defects noticed while working on something else. Format and rules: [README.md](README.md).

## resolve-sync cannot resolve packages from a root-level /node_modules

`src/util/workspace/custom-marko.ts` › `loaderRoot` | 2026-07-21 | impact:low | effort:med

In the `resolve-sync` package (marko-js/resolve-sync, upstream of this repo), `resolvePkg`'s parent-directory walk exits when the current directory reaches the resolution root without ever checking `<root>/node_modules`, so packages mounted at `/node_modules/<name>` are unresolvable from any `from` path. The playground works around this by mounting virtual packages one level deep (`/app/node_modules` in `fetchNodeModules` consumers, `/npm/node_modules` in `custom-marko.ts`), but the behavior differs from node's algorithm (which does check the filesystem root) and cost a debugging cycle. Consider fixing upstream so the walk includes the root directory. Re-verify: `resolveSync("foo", { from: "/_", fs })` with `fs` reporting `/node_modules/foo/package.json` and `/node_modules/foo/index.js` returns undefined/throws instead of resolving.
