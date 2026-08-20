---
type: unclear
impact: med
effort: low
site: public/llms.txt › Reference
---

# Index every public docs page in `llms.txt` and add a completeness check

`public/llms.txt` is a hand-maintained static index with no generator, and three substantive on-disk pages are linked from none of its topic sections: `docs/reference/lazy-loading.md` (the whole `import ... with { load: "visible#hero" }` client code-splitting and deferred-hydration API), `docs/explanation/class-vs-tags-api.md` (the flagship Marko 5-to-6 migration mental-model guide), and `docs/reference/supported-environments.md`. The only aggregate generator, `src/routes/docs/_llms/reference-full%2emd+handler.ts`, hardcodes a 9-page list that includes lazy-loading but omits supported-environments, so even the bundle llms.txt labels "Complete reference documentation" is itself incomplete, and class-vs-tags-api appears in no aggregate at all. Because llms.txt is an agent's primary topic index, an agent asked to add deferred client hydration scans the Reference links, finds no lazy-loading entry, and concludes the capability does not exist; an agent porting a Marko 5 class app never discovers class-vs-tags-api.md and mis-migrates from memory. Add the three pages to their sections, add supported-environments to the reference-full list, and add a test asserting every `docs/**/*.md` slug appears in llms.txt so new pages cannot silently drop out.

Check: `grep -c lazy-loading public/llms.txt` is 0 while `docs/reference/lazy-loading.md` exists; same for `class-vs-tags-api` and `supported-environments`.
