---
type: dx
impact: med
effort: med
site: src/util/workspace/modules-shim.ts › tryResolve
---

# Upstream resolve-sync cannot walk node_modules into the filesystem root

`resolve-sync@1.2.2` has two behaviors that break a virtual filesystem
rooted at `/`: its package walk terminates with `while (dir !== root)`
*before* probing the root directory, so a specifier imported from a
nested module never reaches `/node_modules`; and it joins candidate
paths by concatenation, producing `//node_modules/...` when the walk
does start at `/`. Also `opts.root || "/"` coerces an explicit `root:
""` back to `/`. The playground works around all three with a `root:
"//"` sentinel plus slash normalization in `modules-shim.ts` and
`main-plugin.ts`; an upstream fix (normalize joins, probe the root
before terminating) would let both workarounds be deleted.

Check: `node -e 'import("resolve-sync").then(({resolveSync}) => console.log(resolveSync("dep/x.css", {silent: true, from: "/node_modules/lib/a/b/c.js", fs: {isFile: (f) => ["/node_modules/dep/package.json", "/node_modules/dep/x.css"].includes(f), readPkg: () => ({name: "dep", version: "1.0.0"})}})))'` prints `undefined` even though `/node_modules/dep/x.css` exists.
