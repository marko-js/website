---
type: dx
impact: high
effort: med
site: docs/introduction/integrations.md › ## Testing
---

# Add a Testing guide covering the two-project Vitest setup the starter ships

Everything the site says about testing is the two sentences under `## Testing` in `docs/introduction/integrations.md`, which name `@marko/testing-library` and hand the reader to its GitHub README, and `public/llms.txt` indexes no testing page at all, so an agent scanning the topic list concludes the subject is undocumented. The official `app` starter meanwhile ships a `vitest.config.ts` with two projects, `server` (`environment: "node"`, `src/**/{,*.}server.test.ts`) and `browser` (chromium, `src/**/{,*.}browser.test.ts`), plus `@marko/testing-library` tests beside its `char-count` tag, and nothing on the site explains that split or the filename convention it keys on. A guide should state which project a test belongs in and what each can do, cover `render`, `cleanup` and `fireEvent`, and note that a controlled form element follows `fireEvent.input` rather than `fireEvent.change`, since `packages/runtime-tags/src/dom/controllable.ts` in the marko repo delegates only `"input"`. Leave route handler testing out until the `run` repo's filed defect lands, since importing a `+handler.ts` from a test still throws `ReferenceError: Run is not defined`.

Check: `grep -in test public/llms.txt` returns nothing and `grep -rln testing-library docs/` names only `docs/introduction/integrations.md`; a testing page should exist under `docs/` and appear in the `llms.txt` Guides list.
