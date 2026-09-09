---
type: dx
impact: low
effort: med
site: src/util/workspace/fs.ts › rootDir
---

# Upstream resolve-sync cannot walk node_modules into the filesystem root

`resolve-sync@1.2.2` terminates its package walk with `while (dir !==
root)` *before* probing the root directory, joins candidate paths by
concatenation (yielding `//node_modules/...` when a walk starts at
`/`), and coerces an explicit `root: ""` back to `/` via `opts.root ||
"/"`. The playground sidesteps all three by hosting the virtual
workspace at `/app/` (`rootDir` in fs.ts) instead of `/`; an upstream
fix (probe the root before terminating, join with normalization) would
remove the constraint that the workspace must not sit at the
filesystem root.

Check: `node -e 'import("resolve-sync").then(({resolveSync}) => console.log(resolveSync("dep/x.css", {silent: true, from: "/node_modules/lib/a/b/c.js", fs: {isFile: (f) => ["/node_modules/dep/package.json", "/node_modules/dep/x.css"].includes(f), readPkg: () => ({name: "dep", version: "1.0.0"})}})))'` prints `undefined` even though `/node_modules/dep/x.css` exists.
