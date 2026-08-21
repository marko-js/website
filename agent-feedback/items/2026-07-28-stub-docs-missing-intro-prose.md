---
type: cleanup
impact: med
effort: med
site: docs/explanation/optimizing-performance.md › # Optimizing Performance
---

# Fill in the four docs that have no usable body

`optimizing-performance.md` and `docs/guide/publishing-components.md` are heading-only stubs with no body text at all, `docs/guide/library-integration.md` opens its first section with the bare fragment "Use `<lifecycle>` tag" instead of a sentence, and `docs/guide/duplicate-form-submissions.md` is 118 bytes whose whole body promises content it never delivers ("This guide will discuss disabling buttons & forms after the first submission."), with no headings under it at all. All four are listed in `public/llms.txt` as real pages, so a reader following the Guides index for form handling lands on a promise. Beyond the reader-facing gap, the build derives each page's `<meta name=description>` from its opening paragraph, so the two stubs fall back to the generic site description and library-integration advertises itself to search engines as "Use <lifecycle> tag". Writing an intro paragraph for each fixes both at once; the form guide additionally needs the body its own sentence promises.

Check: `pnpm run build`, then `grep -h '"description"' src/routes/docs/_compiled-docs/{explanation/optimizing-performance,guide/publishing-components,guide/library-integration}+meta.json`; and `wc -c docs/guide/duplicate-form-submissions.md` is 118 against a `duplicate-form-submissions+meta.json` whose `headings` array is empty.
