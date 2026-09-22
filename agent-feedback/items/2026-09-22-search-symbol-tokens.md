---
type: cleanup
impact: med
effort: med
site: src/util/search-worker.ts › init
---

# Index punctuation-bearing identifiers as distinct search tokens

`init` builds the FlexSearch index with the default encoder, which splits on every
non-alphanumeric character. Identifiers whose punctuation carries meaning collapse
onto their bare word, so `@marko/run` indexes as `marko` plus `run` and a query for
`@header` scores identically to `header`. `search` now rewrites a handful of
bare-symbol queries to the section name they stand for, which covers a reader typing
`@` but not a reader searching for a specific punctuated identifier. A custom
`flexsearch.Encoder` with a `split` that keeps `@`, `/`, and `-` inside a token would
fix retrieval at the source, and has to be applied to indexing and querying together.

Check: with `flexsearch` installed, `new flexsearch.Index({ tokenize: "forward" })`
added an entry containing `@header`, then `index.search("header")` returns that entry.
