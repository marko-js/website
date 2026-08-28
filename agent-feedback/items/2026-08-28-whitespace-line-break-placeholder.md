---
type: dx
impact: low
effort: low
site: docs/reference/language.md › ## Whitespace
---

# Say that a line break next to a `${}` placeholder is removed, not only between two tags

`docs/reference/language.md` › ## Whitespace states the rule as "Whitespace that begins with a line break is removed entirely at the start and end of a tag's content and between two tags", and its WARNING repeats it as "A line break between two tags leaves no space between them". In whitespace-collapsing markup the parser drops any whitespace-only run that begins with a line break wherever it sits, so a `${}` placeholder behaves exactly like a tag for that rule: `<b>Total:</b>` followed by a newline and `${input.amount}` renders `<b>Total:</b>5`, and two placeholders on consecutive lines render glued together, while a run that carries content keeps its line break as one space on either side of a placeholder. An author formatting a template across lines therefore loses a separator the page's wording promises to keep. Restate the rule as "a whitespace-only run beginning with a line break is removed", say a `${}` placeholder counts as a tag for it, extend the WARNING's advice to keep a separating space on the placeholder's own line, and leave the existing `<pre>`, `<textarea>`, `<script>` and `<style>` carve-out as is.

Check: with marko 6.3.46, `require("@marko/compiler/register")({ output: "html", sourceMaps: false })` then rendering `<div><b>Total:</b>\n${input.amount}</div>\n<div><b>Total:</b>\nnow</div>\n<p>${input.a}\n${input.b}</p>\n<p>foo\n${input.a}</p>` with `{amount:5,a:"A",b:"B"}` prints `<div><b>Total:</b>5</div><div><b>Total:</b> now</div><p>AB</p><p>foo A</p>`. The Whitespace section predicts a space before each placeholder.
