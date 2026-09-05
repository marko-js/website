---
type: bug
impact: med
effort: med
site: src/util/markodown.ts › compiler.compileSync
---

# Keep method shorthand in the JS variant of marko code blocks

The JS (type-stripped) variant of every `marko` fence is produced by
`@marko/compiler` with `output: "source"` and `stripTypes: true`, and that
printer expands attribute method shorthand into a plain attribute value:
`<button async onClick() { … }>` becomes `<button onClick=async function () { … }>`.
The TS variant, which goes straight to Prettier, keeps the shorthand, so the
two toggles show different syntax for the same snippet and the JS one no longer
demonstrates the feature the surrounding prose describes. The printer lives in
`@marko/compiler` (the `output: "source"` babel generator), so the fix is
upstream: print `AttrMethod`-style function values back as shorthand. Until
then, the docs could skip the compile step when the source contains no TypeScript.

Check: `node -e 'console.log(require("@marko/compiler").compileSync("<button async onClick() { await x() }/>", "t.marko", { output: "source", stripTypes: true }).code)'` prints `onClick=(async function () {`.
