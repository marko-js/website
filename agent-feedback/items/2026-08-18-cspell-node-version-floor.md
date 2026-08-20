---
type: dx
impact: med
effort: low
site: package.json › scripts.lint
---

# Pin the Node version that `pnpm run lint` needs so the pre-commit hook is reproducible

`pnpm run lint`, and therefore the husky pre-commit hook, dies with "Unsupported NodeJS version (22.14.0); >=22.18.0 is required" before cspell checks anything when the `node` that pnpm spawns is older than cspell's engine floor, even when a newer Node is first on `PATH` (the mise-shimmed pnpm resolves its own). The repo declares no `engines`, `.nvmrc`, or mise config pinning Node for contributors, so nothing surfaces the requirement until the hook blocks a commit. Declaring the required Node version in the repo (`engines` plus a mise or `.nvmrc` pin) or running cspell via a version-agnostic entry would make the gate reproducible.

Check: `pnpm run lint` under Node 22.14 aborts on cspell's version check; markdownlint passes and the same command passes under Node 24.19.
