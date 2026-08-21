---
type: dx
impact: low
effort: low
site: src/util/search-index-builder.ts › splitAtHeadings
---

# Start a search block at `####` headings, not only `##` and `###`

`splitAtHeadings` opens a new `SearchBlock` only on a depth 2 or 3 heading and folds every deeper heading into the enclosing block's body, so an answer that lives under an h4 is matchable as text but gets no result of its own and no anchor. `docs/reference/native-tag.md` keeps `#### Form Reset`, `#### Delegation`, `#### Handler Arguments` and six per-element change-handler sections inside `### Change Handlers`, which produces the largest block in the whole index (4978 characters) titled "Change Handlers" and pointing at `#change-handlers`, so a search for "form reset" lands the reader hundreds of lines above the answer even though the page renders an `id="form-reset"` section and the on-page table of contents lists it. Splitting at depth 4 as well is a one-line change to the depth test; the existing `content.length < 30` filter already drops blocks too small to be worth a result.

Check: `pnpm run build`, then `node -e "const b=require('./public/search-index.json'); console.log(b.filter(x=>x.href.endsWith('#form-reset')).length)"` prints `0`; it should print `1`.
