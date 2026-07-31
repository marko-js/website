---
name: board-reconcile
description: Reconcile the marko-js "Roadmap" project board against the pull requests actually merged in a month, and fill in the items and fields that are missing. Use before writing a newsletter, or when asked to check, audit, or catch up the project board for a month.
---

# Board Reconcile

The [marko-js Roadmap board](https://github.com/orgs/marko-js/projects/2) is meant to hold every merged pull request, tagged with the month it shipped. It falls behind during busy months, and a board that is behind is invisibly wrong: the [newsletter](../newsletter/SKILL.md) reads from it, so a gap becomes a month of unreported work.

This skill compares the board against the merged pull requests and closes the difference.

## Authentication

The `reconcile.js` script beside this file talks to the official GitHub API. Do not assume the `gh` CLI is installed. Authenticate with a Personal Access Token in `GITHUB_PROJECT_TOKEN`:

- `check` and `coverage` need `read:project` and `repo`.
- `apply` needs `project` (write) and `repo`, because it writes board fields and assigns pull requests.

The script needs only Node 18+ (it uses the global `fetch`), has no dependencies, and runs from the repo root.

## Step 1 — Check the month

```bash
node skills/board-reconcile/reconcile.js check 2026-07
```

This reports five numbers, all of which should be zero on a healthy month:

- **missing from the board** — merged, not present at all.
- **wrong or absent iteration** — present, but not filed under the month it merged.
- **missing Epic/Task/Status** — present and dated, but not fully tagged.
- **missing an assignee** — the pull request has no assignee, so the item shows as unassigned.
- **on the iteration but not merged this month** — the reverse error, worth a look by hand.

It also prints anything it refuses to guess at: repositories with no `Epic` mapping, and titles with no conventional-commit prefix.

Run `coverage 2026-01 2026-07` for the same comparison across a range of months. That is how to tell a board that is behind from a board that was never used this way: healthy months sit at 93-100%.

## Step 2 — Read what it refuses to guess

Two things need a person, and both are printed by `check`:

- **A repository with no `Epic` mapping.** Add it to `EPIC_BY_REPO` in the script rather than tagging by hand, so the next month is automatic. Ask which epic a genuinely ambiguous repository belongs to instead of picking one.
- **A title with no conventional-commit prefix.** These default to `Chore`, which is right for build and tooling work and wrong for anything user-facing. Read the list. A title like `Support ${...} interpolation in <style> tags` is a `Feat`, not a `Chore`, and needs correcting on the board afterwards.

## Step 3 — Apply

Show the plan before writing to a shared board, and start small:

```bash
node skills/board-reconcile/reconcile.js apply 2026-07 --limit 10
```

Check those ten on the board, then run the rest:

```bash
node skills/board-reconcile/reconcile.js apply 2026-07
```

`apply` is idempotent and resumable. It only touches fields that are actually wrong, adding an item returns the existing one if it is already there, and rerunning after an interruption picks up where it stopped. A busy month is a few thousand mutations, so expect it to take several minutes; it paces itself and retries on rate limits.

Finish by rerunning `check` to confirm every number is zero.

Give it a minute first. Project item indexing lags writes, so a `check` run immediately after `apply` can still report the items it just added as missing. Rerun before concluding that `apply` failed, and confirm against the board itself rather than a second query.

## What the fields mean

The script derives these from conventions the board already follows. Confirm them against the existing items rather than assuming, since they can drift.

| Field       | Derived from                                       |
| ----------- | -------------------------------------------------- |
| `Iteration` | The month the pull request merged, e.g. `Jul 2026` |
| `Epic`      | The repository (`EPIC_BY_REPO`)                    |
| `Task`      | The conventional-commit prefix (`TASK_BY_PREFIX`)  |
| `Status`    | `Done`, since every reconciled item is merged      |
| Assignee    | The pull request author                            |

`Task` maps `fix`, `feat`, `perf`, and `docs` to their obvious counterparts, `refactor` to `Rework`, and `chore`, `test`, `build`, `ci`, and `style` to `Chore`.

## Gotchas

- **Assignee is not a board field.** The board's `Assignees` column reflects the pull request's own assignees, so it cannot be set with `updateProjectV2ItemFieldValue`. The script assigns the pull request itself. Setting every other field and leaving this one produces items that look updated in a table view and unassigned in a board view grouped by assignee.
- **An outside contributor cannot always be assigned.** GitHub rejects assigning a user without repository access, so the script falls back to `FALLBACK_ASSIGNEE`, matching how such pull requests are already handled.
- **Bot pull requests stay off the board.** `[ci] release` commits and anything authored by `github-actions` are filtered out, and the counts above exclude them.
- **Draft issues and issues have no iteration.** The board carries planning items that are not merged pull requests. They are outside this skill's scope, and `check` ignores them rather than reporting them as gaps.
- **GitHub search caps at 1000 results.** A month past that cap would silently truncate, so the script splits the date range until each slice fits. Do not replace it with a single unsplit query.
- **Field and option ids are resolved by name at run time.** Renaming a board option is safe; only `PROJECT_ID` is fixed. If the board is ever recreated, update it by querying `organization(login: "marko-js") { projectV2(number: 2) { id } }`.
- **The board is a moving target.** Pull requests merge while the script runs, so a `check` immediately after an `apply` can legitimately turn up new gaps. Reconciling a month that is still in progress will never settle at zero; wait until the month is over, or accept that a rerun will find whatever merged in between.
- **Do not treat a clean `check` as a clean board.** It only verifies merged pull requests for one month. Items sitting on the iteration that were not merged that month are reported but never modified, because the right fix is a judgment call.
