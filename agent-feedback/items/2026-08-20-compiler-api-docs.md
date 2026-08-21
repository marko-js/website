---
type: dx
impact: high
effort: med
site: docs/guide/low-level-apis.md › ## Writing a Migrator
---

# Document the compiler API the low-level guide promises

`docs/guide/low-level-apis.md` is 379 bytes: one intro paragraph, then `## Writing a Migrator` and `## Writing a Translator` with nothing under either, and it is the only entry `public/llms.txt` offers for the compiler ("Advanced low-level APIs"). Nothing else on the site names the API those sections need. `grep -rniE 'compileSync|compileFile|@marko/compiler|babel-utils' docs/` matches one newsletter sentence, and the generated `/docs/reference-full.md` bundle contains none of it, so an agent asked to write a codemod, a migrator or a bundler integration reverse-engineers `@marko/compiler`'s `index.d.ts`, which exports `compile`, `compileSync`, `compileFile`, `compileFileSync`, `configure`, `getRuntimeEntryFiles` and a `taglib` namespace. The version relationship is unstated too: `marko@6.3.44` depends on `@marko/compiler@^5.42.2`, so a search for the installed compiler's documentation lands on the Marko 5 site, and no page says that pairing is expected. Fill the two sections against the `migrator` and `translator` hooks the taglib loader reads from `marko.json`, and give the compiler entry points a reference page indexed in `llms.txt`.

Check: `grep -rniE 'compileSync|compileFile|@marko/compiler' docs/ | grep -v newsletter` returns nothing and `wc -c docs/guide/low-level-apis.md` prints 379; expect both sections to have bodies and the compiler entry points and their output modes to be documented somewhere under `docs/`.
