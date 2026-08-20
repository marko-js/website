---
type: unclear
impact: med
effort: low
site: docs/reference/core-tag.md › ## <script>
---

# Document when a `<script>` that reads a tag variable first runs

The `<script>` section says the body "is executed first when the template has finished rendering and is mounted in the browser" and re-runs when a referenced tag variable changes, which leaves source order as the only ordering a reader can infer between two `<script>` tags. Marko compiles a `<script>` that reads a tag variable into that variable's own setup, so it first runs when the variable initializes, ahead of an earlier-in-source `<script>` that reads nothing. Given `<let/board=DEFAULT/>`, a first script that only assigns `board` from `localStorage`, and a second that reads `board` and writes it back, the second runs first with `DEFAULT` and overwrites the saved value before the restore reads it: the compiled dom output puts the persist effect inside `_let(...)` while the restore stays a separate `$setup__script`. The page's own `<script=remember/>` example already persists `input.collapsed` to `sessionStorage` without saying when it first fires, so the rule belongs there, stated positively: reading a tag variable ties the effect to that variable's initialization. The paired restore-and-persist idiom belongs under `## <lifecycle>`, whose `onMount`/`onUpdate` handlers already model "set up once, then follow the value".

Check: `grep -n "finished rendering" docs/reference/core-tag.md` is the page's only ordering statement and `grep -rn "localStorage" docs/` returns nothing, so neither the rule nor the idiom is documented; the clobber reproduces in the local playground (`pnpm run dev`).
