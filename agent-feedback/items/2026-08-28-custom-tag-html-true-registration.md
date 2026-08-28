---
type: dx
impact: med
effort: low
site: docs/reference/custom-tag.md › ## Installed Custom Tags
---

# Show the marko.json `"html": true` registration for unknown native tags on custom-tag.md

The compiler knows 111 HTML tags (`marko/packages/compiler/src/taglib/marko-html.json`), and anything outside that list, `<center>`, `<o:p>` or a custom element, fails to compile with an error linking to `docs/reference/custom-tag.md#relative-custom-tags`. The supported registration is `{ "<center>": { "html": true } }` in a `marko.json` beside the template or in any ancestor directory (taglib loader `loadTagFromProps.js` › `html`, consumed by compiler `babel-utils/tags.js` › `isNativeTag`), after which both html and dom output emit the element verbatim. On the site that registration appears only under `docs/reference/typescript.md` › ### Registering a new native tag (e.g. for custom elements), a page a JavaScript author chasing `<center>` never opens, while the page the error links to shows `marko.json` in its package `exports` form alone. State the rule and the example on `custom-tag.md` next to that existing `marko.json` block, and cross-link it from `docs/reference/native-tag.md` and from the typescript.md section.

Check: `printf '<center>x</center>\n' > a/x.marko`, then in the marko checkout `pnpm run compile -- -o html -d a/x.marko` exits 1 with ``Unable to find entry point for [custom tag](https://markojs.com/docs/reference/custom-tag#relative-custom-tags) `<center>`. Did you mean `<meter>`?``; adding `{ "<center>": { "html": true } }` as `marko.json` beside the file makes the same command write `x.marko.js` containing `_html("<center>x</center>")`, and `-o dom` likewise. `grep -rn '"html": true' docs` hits only `docs/reference/typescript.md`, and `grep -n -i 'marko.json\|"html"' docs/reference/custom-tag.md docs/reference/native-tag.md` hits only custom-tag.md's package `exports` example.
