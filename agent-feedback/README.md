# Agent Feedback

Actionable observations that were out of scope for the task that surfaced them. In scope: fix it. Out of scope: file it here. Never expand a task's diff to fix an item recorded here.

One item per file in `items/`, named `YYYY-MM-DD-<slug>.md`.

## When to file

Anything a future contributor should act on:

- `bug`: a suspected defect left unpursued
- `cleanup`: duplication, dead code, inconsistency, refactor opportunity
- `perf`: speed, memory, payload or bundle size, build time
- `dx`: friction in builds, tests, tooling, or repo workflows
- `unclear`: code or docs that were confusing, and what would have clarified them

## Rules

1. **Verify first.** A guess is not feedback. Every item ends with a check that reproduces the claim.
2. **Dedupe first.** `grep -ril '<path or symbol>' agent-feedback/items`. If a file covers it, edit that file only when you add new information.
3. **Check the code site.** An intent comment there means the behavior is deliberate. Do not file it.
4. **Self-contained.** Paths, symbols, reasoning. Never reference conversation context or "earlier analysis".
5. **Cite by stable symbol**, never line number.
6. **State the defect and the check.** Never describe what works. Never narrate a landed fix.
7. **Direction is preventive for `unclear` and `dx`.** Name what would have stopped the trip: a comment, a doc line, a lint rule, a compile error, a debug-only warning. The goal is that the next agent does not hit it.
8. **Resolve by deleting the file in the same PR as the fix.** A partial fix rewrites the file to what remains.
9. **Won't-fix is a maintainer's call, never an agent's.** Add a comment (two lines max) at the code site stating the behavior and why it is deliberate, then delete the file. The comment is what stops re-filing. Never consult git history to learn whether something was resolved; if it is not in `items/` and not commented at the site, it is unresolved.

## Item format

`items/YYYY-MM-DD-<slug>.md`:

```md
---
type: bug | cleanup | perf | dx | unclear
impact: high | med | low
effort: high | med | low
site: <path/to/file.ts> › <nearestStableSymbol>
---

# <one-line imperative title>

<2-6 sentences: the problem, why it matters, a concrete direction. Cut evidence a fixer can re-derive from the site.>

Check: <command, input, or observation that reproduces the claim>
```

`impact`: what breaks or is lost if ignored. `effort`: expected size of the fix. Both are the filer's estimate; triage re-judges.

## Repo notes

The markojs.com site: docs as markdown under `docs/`, a `@marko/run` app under `src/`, plus the browser playground. The root `AGENTS.md` holds the documentation writing guidelines and they govern any docs change; read it too.

**Reproduce a claim.**

- Docs content: `grep` the page, then verify the behavior it describes against Marko runtime source, a fixture snapshot, or a compiled probe. An existing docs sentence is not evidence.
- Anchors and slugs: `github-slugger` resolves collisions in document order, so a second heading with the same slug becomes `#name-1`. Check with the slugger directly rather than guessing.
- Playground and site behavior: `pnpm run dev`, then reproduce in the browser.
- Build-derived output (page `<meta>`, generated llms bundles): `pnpm run build`, then read `src/routes/docs/_compiled-docs/`.

**Guard tests.** `pnpm test` (`vitest run`). A docs-structure claim (every page indexed, every anchor resolving) is best guarded by a test that walks `docs/**/*.md`, not by a snapshot of one page.

**Pre-ship.** `pnpm run lint` (markdownlint over `docs/**/*.md`, then cspell) and `pnpm run type-check` (`marko-type-check`). `pnpm run build` when the change can affect generated output.

**Gotchas.** `pnpm run lint` runs cspell, which has a Node engine floor above some default installs and aborts on the version check before checking anything; the husky pre-commit hook hits the same wall. Never document a known Marko bug as intended behavior: file the defect instead. Never use an em dash in docs, and grep `' - '` too, since a spaced hyphen doing the same job is the same problem.
