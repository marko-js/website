---
type: perf
impact: med
effort: med
site: src/tags/live-preview/core/shiki.ts › default export
---

# Shrink the chunk fetched when a live preview scrolls into view

On a built page, scrolling a `<live-preview>` into view fetches about 1.75 MB of JS before the first edit (a 1.1 MB chunk and a 0.6 MB chunk), most of it the shiki highlighter with its oniguruma wasm and the grammars it registers. `shiki.ts` registers css, html, xml, js, json, marko, sh, toml and ts for every example, though an example usually needs one or two. Loading grammars per file extension through `highlighter.loadLanguage` would cut the cost for typical examples.

Check: build the site, open a page with a `<live-preview>`, and compare the response sizes of the `.js` assets requested after the example scrolls into view.
