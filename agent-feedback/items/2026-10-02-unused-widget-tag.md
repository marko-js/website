---
type: cleanup
impact: low
effort: low
site: src/tags/widget/path-utils.ts › createWidgetPath
---

# Remove or adopt the unused `<widget>` tag

`src/tags/widget/` defines a `<widget>` tag that draws a puzzle-piece body from `createWidgetPath`, but no template renders it: every mascot on the site is a static file under `public/assets/widget/`, loaded through `<img>` or `background-image`. Delete the directory, or adopt it if the mascots move to inline SVG, which pointer-driven effects such as eyes that follow the cursor would need.

Check: `grep -rnE "^\s*<?widget[ /]" src --include=*.marko` matches nothing outside `src/tags/widget/`, and `grep -rn createWidgetPath src` matches only `src/tags/widget/`.
