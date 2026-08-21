---
type: dx
impact: med
effort: low
site: docs/introduction/integrations.md › ## Editor Tooling
---

# Give the language server a start-here page and scope the highlighting claim

`## Editor Tooling` states that the Language Server "provides syntax highlighting, IntelliSense, type checking, and accessibility hints for Marko files in any editor that supports the Language Server Protocol", but the server advertises no `semanticTokensProvider` in its initialize response, so highlighting comes from the VS Code extension's TextMate grammar and a bare LSP client opens an without syntax highlighting file with nothing to explain it. Those five lines are also the whole of the site's editor documentation: `docs/introduction/installation.md` › `## IDE Plugin` hands non-VS-Code readers to the language server repository, whose README is four sentences with no launch instructions, and `public/llms.txt` indexes no editor or tooling page at all. Nothing under `docs/` names the `marko-language-server` binary or the `--stdio` transport it requires, and starting it without one exits with "Connection input stream is not set", which is the first thing a reader setting up Neovim, Helix or Zed hits. An Editor Tooling page naming the binary, the transport flag and one non-VS-Code client configuration would close it, with the highlighting sentence scoped to the VS Code extension.

Check: `grep -rn 'marko-language-server\|stdio' docs/ public/llms.txt` returns nothing and `grep -in 'language.server\|editor' public/llms.txt` returns nothing; expect an indexed editor tooling page that names the binary and `--stdio`, and a highlighting sentence that no longer promises it over LSP.
