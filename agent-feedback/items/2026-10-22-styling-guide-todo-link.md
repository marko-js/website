---
type: bug
impact: low
effort: low
site: docs/guide/styling.md › first paragraph
---

# Replace the `(TODO)` link in the styling guide

The first paragraph of `docs/guide/styling.md` links "bundler used in the project" to the literal target `TODO`. It renders as a relative link to `/docs/guide/TODO`, which the static crawl reports as a 404 on every build. Point it at the page that explains how the bundler processes `<style>` (or drop the link if no such page exists yet).

Check: `grep -n "(TODO)" docs/guide/styling.md`, then `pnpm run build` and look for `/docs/guide/TODO 404` in the crawl summary.
