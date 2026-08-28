---
type: cleanup
impact: med
effort: med
site: docs/explanation/nested-reactivity.md › ## Case 3: Complex Hoisted State
---

# Write the Case 3 section of nested-reactivity.md and drop the `<mut>` TODO comment

`docs/explanation/nested-reactivity.md` ends at `## Case 3: Complex Hoisted State`, whose entire body is an HTML comment reading `TODO: discuss <mut> tag`. The section is load-bearing: the page's TLDR promises "Three approaches" and its intro promises "3 ways", and the heading is a live sidebar link, since markodown's heading renderer records every h2 into `meta.headings` and `src/routes/docs/+layout.marko` feeds those to `TocTree`, so a reader lands in an empty `<section id="case-3-complex-hoisted-state">`. The raw markdown is served as-is (`public/docs` is a symlink to `../docs`) and `public/llms.txt` points agents at that URL, so the comment also promises a `<mut>` tag that Marko does not ship. Write the section against the pattern Case 2 already sets up, an immutable update with a keyed `<for>`, and remove the comment.

Check: `tail -3 docs/explanation/nested-reactivity.md` prints the `## Case 3: Complex Hoisted State` heading, a blank line and the TODO comment as the file's last lines. `grep -rnw mut` over `docs/`, the marko packages and both cheatsheets returns that one line, and in the marko checkout `pnpm run compile -- -o dom -d` on `<let/x={a:1}/>` plus `<mut=x.a>2</mut>` fails with ``Unable to find entry point for [custom tag](https://markojs.com/docs/reference/custom-tag#relative-custom-tags) `<mut>`. Did you mean `<dt>`?``
