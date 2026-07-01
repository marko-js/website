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

## Step 4 — Gather community content

A newsletter edition can include a `## Community` section alongside the shipped-work themes, but only when there is something real to put in it. This is the one step the board and merged-PR lists cannot fully cover, so it splits into what is automatable and what is not.

Automatable: first-time contributors.

```bash
node skills/newsletter/pull-board.js contributors 2026-07
```

Lists merged PRs that month whose author's association is `FIRST_TIME_CONTRIBUTOR` (first PR to that repo) or `FIRST_TIMER` (first PR anywhere on GitHub), tab-separated as `repo#number`, author, title. Every row is a reasonable candidate for a welcome or thanks mention.

Not automatable: everything else. Showcases, conference talks, blog posts, Discord highlights, and noteworthy GitHub Discussions threads have no reliable API source, so do not guess at them or invent one to fill the section. Ask the user directly, for example: "Anything for a Community section this month, beyond new contributors? Looking for showcases, talks, Discord highlights, or shoutouts." If the user has nothing to add, drop the `## Community` section entirely rather than publishing an empty or generic one.

Keep each attribution short and credit the handle, but do not force it into a single fill-in-the-blank template repeated verbatim for every entry, which reads as a form letter. Where there is a concrete, checkable sign of what the contribution led to, such as the change now shipping in the project's own docs or a live site, prefer working that in over a generic thanks.

Whatever the phrasing, this section is a shoutout, not a feature writeup, so skip the mechanism-and-benefit prose used elsewhere in the newsletter, and state only what the PR, a linked page, or the user directly confirms. Do not infer or add an employer, team, or motivation that is not stated outright. When a contributor's affiliation is genuinely relevant and confirmed, it can be worth a mention, but guessing at one from a bio or username is the kind of error that erodes trust in the newsletter.

## Step 5 — Write the page

Create `docs/newsletter/<month>-<year>.md` (e.g. `july-2026.md`). The `markodown` Vite plugin globs `docs/**/*.md` and auto-generates the route `/docs/newsletter/<slug>`, so no routing wiring is needed.

The page is tiered: the handful of items that define the month read first at full depth, and everything else stays discoverable in compact buckets behind them.

- A single `# Title` H1 (its text becomes the page title).
- A `> [!TLDR]` callout with one bullet per headline section, in the same order, then a short intro paragraph that frames the month around them. Do not start the intro with "This newsletter covers...".
- **Headlines**: zero to five flat `## ` sections directly after the intro, one per item that defines the month. Any kind of change qualifies (a feature, a milestone, a performance win, even a major fix); the bar is whether most Marko developers would care, not what kind of change it is. Each gets the full treatment: what shipped, why it matters, and usually a code example. Order them by expected developer impact. A quiet month can have no headlines, in which case the TLDR draws from the buckets below instead; never pad this tier to fill it.
- `## Improvements` collects the rest of the shipped feature and developer-experience work as `### ` themes (editor support, error messages, playground, and so on), ordered by impact, each a paragraph or two. Open the section with a single framing sentence before the first theme. When a theme grows past a couple of paragraphs and a code example, that is a sign it belongs in the headline tier instead.
- `## Fixes` collects correctness work. A batch with a story gets its own `### ` theme (a round of resumability fixes, an interop hardening pass); one-liners sweep into a short bullet list at the end. A fix for a feature that shipped this same month still folds into that feature's section (Step 3) rather than landing here.
- The standing release-notes line ("Full details for every change are in the release notes of each package on [GitHub](https://github.com/marko-js).") closes the shipped-work portion, after `## Fixes`.
- A `## Community` section, when Step 4 turned up content. Use `### ` subsections when it holds multiple substantial items (a showcase, a blog post, an integration); keep a single item or short shout-outs as plain prose. First-time contributor thanks sit at the end. Omit the heading entirely rather than leaving it empty.

Keep paragraphs short everywhere; split dense lists into chunks.

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

## Step 6 — Examples and links

Add a code example to a section **only when there is a new, authoring-facing capability to show.** Headline sections usually earn one; `## Improvements` themes occasionally do; `## Fixes` and `## Community` almost never do. Do not force one onto sections about bug fixes, platform support, parser internals, or UI work, which usually read better with none.

Code block rules:

- ` ```marko ` blocks are compiled and rendered with HTML/Concise and TS/JS toggles. They must compile or they silently fall back to raw text (losing the toggles). Write valid Marko 6.
- Use ` ```marko no-format ` for concise-mode snippets, intentional anti-patterns, and interop/opt-in comments. It shows the code verbatim and skips compilation, which is what those need.
- Use ` ```text ` for directory trees and ` ```js ` for an illustrative compiled-output fragment.
- A single standalone code block gets **no** filename comment. Only add `/* file.ext */` when two or more blocks appear together and need disambiguating.
- Examples must be unique. Do not paste an example verbatim from the docs; adapt it.

Links:

- Link relevant existing docs with a relative path and the `.md` extension, e.g. `[Lazy Loading](../reference/lazy-loading.md#triggers)`. The build strips `.md` automatically. Confirm anchors against the target doc's headings (GitHub-style slugs).
- Link the playground to `/playground` and "GitHub" to `https://github.com/marko-js`.

## Step 7 — Link the new edition

The newsletter is wired together in three places. Update all of them when adding a month.

Label every cross-link with the bare month and year, e.g. `June 2026`, never `Marko in June 2026`.

The landing page archive in `docs/newsletter.md`, under `## Archive`, lists every edition ever, grouped by year (newest year first, newest month first within a year). Add the new month to the top of its year's list, adding a new year heading if the month starts one, and never remove older ones:

```markdown
- 2026
  - [July](newsletter/july-2026.md)
  - [June](newsletter/june-2026.md)
```

The left nav in `src/tags/app-menu/app-menu.marko`, under the `Newsletter` section, shows only the three latest editions (bare month, no year), followed by a `...more` link to the landing page. Add the new month at the top and drop the oldest so three remain above the `...more` entry:

```marko
li
  strong -- Newsletter
  ul
    Page="/docs/newsletter/july-2026" -- July
    Page="/docs/newsletter/june-2026" -- June
    Page="/docs/newsletter/may-2026" -- May
    Page="/docs/newsletter" -- ...more
```

Each edition ends with a `## Further Reading` section linking the adjacent editions, which the docs layout styles as cards. List the edition before it first, then the one after it. End the new page with a link back to the previous edition; it has no later edition yet:

```markdown
## Further Reading

- [June 2026](june-2026.md)
```

Then edit what was the newest edition to add the forward link below its existing back link:

```markdown
## Further Reading

- [May 2026](may-2026.md)
- [July 2026](july-2026.md)
```

The oldest edition links only forward, the newest links only back, and every edition in between links both ways.

## Step 8 — Verify

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

## Step 9 — Confirm and hand off

Surface judgment calls to the user rather than guessing: the `Task` type for a PR with no conventional-commit prefix, an ambiguous `Epic`, which performance number to quote, and how wide the scope should be. Do not commit unless asked.

## Gotchas

- Verify the nature of a change before writing it. A title can look feature-shaped when the PR is actually a bug fix; framing matters.
- When a fix corrects a feature that shipped the same month, describe the net shipped behavior and fold the fix in as a follow-up, rather than listing both or dropping the fix.
- Reconcile the board against the merged list every time. The board is often incomplete, and an untracked PR can be the month's lead story.
- Tier by expected developer impact, not by board order, PR number, or kind of change: headlines are the 0-5 items most developers would care about, and the same impact ordering applies within `## Improvements` and `## Fixes`.
- Never pad the headline tier. Zero headlines is a valid shape for a quiet month; five mediocre headlines bury the one that matters.
- Do not force examples. Sections about fixes, platform support, parser internals, or UI often read better with none.
- Get numbers from the PR, with their real scope, and keep the PR's own caveats.
- Keep implementation detail out of prose; keep compiled-output examples illustrative.
- The TLDR renders as a run-on unless it is a real markdown list.
- `no-format` is the right tool for concise/anti-pattern/opt-in snippets.
- Community content beyond first-time contributors (showcases, talks, Discord, Discussions) has no reliable API source. Ask the user rather than guessing, and drop the `## Community` heading if there is nothing to put in it.
- Keep attributions short and credit the handle, but do not repeat the same "Thanks to X for contributing Y" template verbatim every time; work in a concrete, checkable detail (shipped in the project's docs, a live site) when one exists. Never add an affiliation, team, or motivation that is not directly confirmed.
