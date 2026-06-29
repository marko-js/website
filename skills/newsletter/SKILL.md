---
name: newsletter
description: Build the monthly Marko newsletter for the website from the marko-js "Roadmap" project board. Use when asked to write, draft, or update the newsletter for a given month (e.g. "write the July newsletter", "draft this month's newsletter").
---

# Marko Monthly Newsletter

The newsletter summarizes a month of shipped work for developers who use Marko. It is a docs page under `docs/newsletter/`, generated from the [marko-js Roadmap project board](https://github.com/orgs/marko-js/projects/2) and written to the project's documentation style.

Use `docs/newsletter/june-2026.md` as the canonical example to mirror. Follow [AGENTS.md](../../AGENTS.md) for all writing style.

The core principle: **understand each change before writing about it.** A title is a starting point, not the story. Read the PR, know whether it is a feature, a fix, or a performance change, and never present a bug fix as new behavior.

## Authentication

Data is pulled from the official GitHub API by the `pull-board.js` script that ships beside this skill. Do not assume the `gh` CLI is installed. Authenticate with a Personal Access Token in the `GITHUB_PROJECT_TOKEN` environment variable: a classic PAT with the `read:project` and `repo` scopes (a fine-grained PAT needs read access to the org's projects, plus repository contents and pull requests). The script bails when the token is missing.

The script needs only Node 18+ (it uses the global `fetch`), has no dependencies, and runs the same on macOS, Linux, Windows, or CI. Run it from the repo root.

## Step 1 — Pull the month from the board

The board tracks every merged PR with an `Iteration` (e.g. `Jul 2026`), an `Epic`, a `Task` type, and a `Status`. Pull the target month's items by iteration title:

```bash
node skills/newsletter/pull-board.js "Jul 2026"
```

Each line is tab-separated: `repo#number`, `Epic`, `Task`, then the title. The pull filters on the `Iteration` field by name, so the project's field and option IDs can change without breaking it.

**Always reconcile against the merged list.** The board is frequently incomplete, so treat the PRs merged that month as an equally authoritative source:

```bash
node skills/newsletter/pull-board.js merged 2026-07
```

Diff the two lists. Any merged, user-facing PR missing from the board still belongs in the newsletter, and untracked PRs are often the month's most important work rather than noise, so weigh each on its merits and let one lead the issue if it deserves to. Categorize the gaps as you go (the `Marko` epic covers `marko-js/marko`, `Language Tools` covers the editor/parser repos).

Note: the project ID is hard-coded in the script as `PROJECT_ID`. If the board is ever recreated, update it by querying `organization(login: "marko-js") { projectV2(number: 2) { id } }`.

## Step 2 — Filter for the audience

The newsletter is for Marko developers, so drop anything internal or inconsequential to them:

- `[ci] release` bot PRs (and anything authored by `github-actions`).
- Test-runner / snapshot / CI chores, dead-code cleanup, internal refactors with no behavior change, release dist-tag plumbing, logo updates.
- Micro-optimizations with no user-visible effect, unless they roll up into a notable number.

Keep features, user-facing bug fixes, performance wins, editor/tooling improvements, and playground changes. Group the survivors into themes (assets, await, editor support, performance, and so on) rather than listing PRs one by one.

## Step 3 — Understand each change

For every item that might make the cut, read the PR before describing it:

```bash
node skills/newsletter/pull-board.js pr <repo> <number>
```

This prints the PR title, body, any linked issues, and the changed source files (test and generated files such as snapshots and `sizes.json` are filtered out). PR bodies are often terse: when one is, follow a referenced issue with `issue <repo> <number>` or read the listed source files to understand what actually changed.

From the body and that context, determine:

- **What kind of change it is.** Features read as features, fixes read as fixes. The `Task` field and the commit prefix (`feat`/`fix`/`perf`/`refactor`) are hints, but confirm against the body. When a section is all fixes, say so plainly, so improvements to existing behavior are not mistaken for new capabilities.
- **A fix for this month's own feature.** When a PR corrects a regression or edge case in a feature that also shipped this month, describe the net behavior that actually shipped and fold the fix in as a correctness follow-up. Do not list the feature and its fix as two separate headline items, and do not drop the fix.
- **Real magnitudes.** Pull performance numbers from the PR, never invent them. State them with their scope rather than vaguely, qualifying a percentage with what it was measured against or a benchmark multiple as measured in isolation, and keep any caveat the PR itself makes. When a PR gives no figure, describe the mechanism and the direction of the effect (smaller output, fewer allocations, less work to resume) rather than reaching for a vague percentage.
- **The user-facing shape.** Skip implementation detail in prose. Prefer "in debug mode" over an env var name; show an illustrative compiled-output fragment, not a dump of internal helper names.

## Step 4 — Write the page

Create `docs/newsletter/<month>-<year>.md` (e.g. `july-2026.md`). The `markodown` Vite plugin globs `docs/**/*.md` and auto-generates the route `/docs/newsletter/<slug>`, so no routing wiring is needed.

Structure:

- A single `# Title` H1 (its text becomes the page title).
- A `> [!TLDR]` callout listing the highest-impact items first, then a short intro paragraph that frames the month around them. Do not start the intro with "This newsletter covers...".
- Flat `## ` sections, each a theme, **ordered by expected developer impact**: lead with the change most developers will notice or benefit from, and let lower-impact items (niche fixes, platform notes, internal-leaning work) fall toward the end. Keep paragraphs short; split dense lists into chunks.

Style (see AGENTS.md, enforced by the docs lint):

- Impersonal voice, no second person "you". Headings are 1-3 word nouns with no colons. Heading depth must not skip levels (H1 then H2 then H3).
- No emdash. Backticks for code, file names, and APIs. `**bold**` sparingly. Avoid the `**Bold Title**: description` bullet pattern.
- The TLDR must be a real markdown list or it renders as one run-on line:

  ```markdown
  > [!TLDR]
  >
  > - First item
  > - Second item
  ```

  (Blank `>` line, then `- ` items, no trailing periods.)

## Step 5 — Examples and links

Add a code example to a section **only when there is a new, authoring-facing capability to show.** Do not force one onto sections about bug fixes, platform support, parser internals, or UI work, which usually read better with none.

Code block rules:

- ` ```marko ` blocks are compiled and rendered with HTML/Concise and TS/JS toggles. They must compile or they silently fall back to raw text (losing the toggles). Write valid Marko 6.
- Use ` ```marko no-format ` for concise-mode snippets, intentional anti-patterns, and interop/opt-in comments. It shows the code verbatim and skips compilation, which is what those need.
- Use ` ```text ` for directory trees and ` ```js ` for an illustrative compiled-output fragment.
- A single standalone code block gets **no** filename comment. Only add `/* file.ext */` when two or more blocks appear together and need disambiguating.
- Examples must be unique. Do not paste an example verbatim from the docs; adapt it.

Links:

- Link relevant existing docs with a relative path and the `.md` extension, e.g. `[Lazy Loading](../reference/lazy-loading.md#triggers)`. The build strips `.md` automatically. Confirm anchors against the target doc's headings (GitHub-style slugs).
- Link the playground to `/playground` and "GitHub" to `https://github.com/marko-js`.

## Step 6 — Add to the menu

Add the page to the left nav in `src/tags/app-menu/app-menu.marko`. Newsletters live under a `Newsletter` section near the top, listed newest first:

```marko
li
  strong -- Newsletter
  ul
    Page="/docs/newsletter/july-2026" -- July 2026
```

## Step 7 — Verify

```bash
npx markdownlint docs/newsletter/<file>.md
npx cspell --no-progress docs/newsletter/<file>.md
npm run build
```

- cspell uses a curated word list in `cspell.json`. Add legitimate new terms (package names, etc.) alphabetically rather than rewording around correct words. Reword only coined words (e.g. avoid "fast-pathing").
- `npm run build` exercises code-block compilation and the heading-nesting check, so it is the real verification. If the page has any ` ```marko ` blocks, confirm they compiled by grepping the generated page for `markoAlts=` (a page with no marko examples is fine, and the count is legitimately 0):
  `grep -c 'markoAlts=' src/routes/docs/_compiled-docs/newsletter/<slug>+page.marko`
  Then confirm internal links resolved with no leftover `.md`:
  `grep -oE 'href="[^"]*\.md[^"]*"' src/routes/docs/_compiled-docs/newsletter/<slug>+page.marko` (should print nothing).
- The build can fail nondeterministically on an unrelated doc (e.g. `docs/guide/low-level-apis` with `Cannot read properties of undefined (reading 'ast')`) because docs compile in parallel. If the newsletter page itself generated fine, rerun a clean build: `rm -rf dist && npm run build`.

## Step 8 — Confirm and hand off

Surface judgment calls to the user rather than guessing: the `Task` type for a PR with no conventional-commit prefix, an ambiguous `Epic`, which performance number to quote, and how wide the scope should be. Do not commit unless asked.

## Gotchas

- Verify the nature of a change before writing it. A title can look feature-shaped when the PR is actually a bug fix; framing matters.
- When a fix corrects a feature that shipped the same month, describe the net shipped behavior and fold the fix in as a follow-up, rather than listing both or dropping the fix.
- Reconcile the board against the merged list every time. The board is often incomplete, and an untracked PR can be the month's lead story.
- Order sections by expected developer impact, not by board order, PR number, or theme grouping.
- Do not force examples. Sections about fixes, platform support, parser internals, or UI often read better with none.
- Get numbers from the PR, with their real scope, and keep the PR's own caveats.
- Keep implementation detail out of prose; keep compiled-output examples illustrative.
- The TLDR renders as a run-on unless it is a real markdown list.
- `no-format` is the right tool for concise/anti-pattern/opt-in snippets.
