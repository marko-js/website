---
type: cleanup
impact: med
effort: med
site: docs/explanation/optimizing-performance.md › # Optimizing Performance
---

# Fill in the three docs that have no usable opening prose

`optimizing-performance.md` and `docs/guide/publishing-components.md` are heading-only stubs with no body text at all, and `docs/guide/library-integration.md` opens its first section with the bare fragment "Use `<lifecycle>` tag" instead of a sentence. Beyond the reader-facing gap, the build derives each page's `<meta name=description>` from its opening paragraph, so the two stubs fall back to the generic site description and library-integration advertises itself to search engines as "Use <lifecycle> tag". Writing an intro paragraph for each fixes both at once.

Check: `pnpm run build`, then `grep -h '"description"' src/routes/docs/_compiled-docs/{explanation/optimizing-performance,guide/publishing-components,guide/library-integration}+meta.json`.
