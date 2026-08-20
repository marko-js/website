---
type: cleanup
impact: low
effort: low
site: src/util/markodown.ts › markoDocs
---

# Remove the empty token-type branch in the markodown walker

Inside `markoDocs()`'s `walkTokens`, after the code-fence handling there is a chain that begins `if (token.type === "code" && token.lang === "marko") {}` with an empty body, followed by an `else if (token.type === "codespan")` branch whose only content is a commented-out line. Only the final `else if (token.type === "link")` branch does anything. The two dead branches read as if they carry behavior and slow down anyone tracing how tokens are transformed; collapsing the chain to a single `if (token.type === "link")` preserves behavior.

Check: read the chain in `markoDocs`, then run `pnpm test`.
