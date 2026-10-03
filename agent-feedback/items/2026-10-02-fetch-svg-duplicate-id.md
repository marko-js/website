---
type: cleanup
impact: low
effort: low
site: public/assets/widget/fetch.svg › clipPath#c
---

# Give Fetch's mouth clip path a unique id

In every `fetch*.svg`, `id="c"` sits on both the mouth `<clipPath>` and the mouth `<ellipse>`, and `<use href="#c" fill="black">` points at it. Renderers disagree on which element that resolves to: resvg picks the clip path and draws nothing, while Chromium draws the ellipse a second time. The `<use>` adds nothing either way. Rename one of the ids and delete the `<use>` in the adaptive files and their `-light`/`-dark` copies.

Check: `grep -c 'id="c"' public/assets/widget/fetch.svg` prints 2. Delete the `<use href="#c">` line and render both versions: resvg output is byte-identical, and Chromium's differs only in anti-aliasing at the mouth edge.
