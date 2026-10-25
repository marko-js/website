---
type: dx
impact: med
effort: med
site: vite.config.ts › defineConfig
---

# Find why `pnpm build` fails from some checkout paths but not others

`pnpm build` in a git worktree at `/Users/<user>/work/<workspace>/website` stops in the client build with `Failed to resolve .../dist/.marko-run/<route>.client-entry.marko from .../<route>.marko.html` for every page, after the server build and crawl succeed. The same commit checked out at `/tmp/<dir>` (a plain `git worktree add` plus `pnpm install --frozen-lockfile`) builds and crawls all routes. Something path-dependent in the marko-run client entry emission or the HTML entry resolution is the likely cause. Finding it would let agents verify production builds in their own checkout.

Check: in a checkout under `/Users/<user>/work/<workspace>/website` run `rm -rf dist && pnpm build`; then `git worktree add --detach /tmp/wt <same commit>`, `pnpm install --frozen-lockfile` there, and run the same build.
