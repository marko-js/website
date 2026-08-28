---
type: dx
impact: low
effort: low
site: docs/introduction/installation.md › ## Marko Run Setup (Recommended)
---

# Name the four starter templates and the non-interactive flags beside `npm init marko -- -t basic`

`docs/introduction/installation.md` › ## Marko Run Setup (Recommended) shows `npm init marko -- -t basic` and no other template name or CLI flag, and `docs/marko-run/getting-started.md` › ## Using a Template shows a bare `npm init marko` with the phrase "After choosing a template and project name" and names none. An interactive run does offer `app`, `basic`, `library` and `vite-express`, but `@marko/create` skips every prompt under CI, an AI agent or a piped stdin (`acceptDefaults = yes || isAgent() || isCI()`), so the readers who must pass `-t` are exactly the ones who never see the list, and their fallbacks stop short of it: the `create-marko` alias that `npm init marko` runs publishes no README, and `@marko/create`'s README names `basic` alone and omits `--no-install` and `--no-git`, which only `--help` lists. Put the four names beside the `-t basic` line, say they are examples from marko-js/examples (minus the `-marko-5` ones) so the list is understood to track that repo, and add `-n/--name`, `-y/--yes`, `--no-install` and `--no-git`.

Check: `grep -rn -e 'vite-express' -e '\-\-no-git' -e '\-\-no-install' -e '\-t library' -e '\-t app' docs public` prints nothing, while `grep -rn 'npm init marko' docs` prints `docs/introduction/installation.md:19:npm init marko -- -t basic` and `docs/marko-run/getting-started.md:12`. `npm view create-marko readme | wc -c` prints `0` and `npm pack create-marko@6.3.0 && tar tzf create-marko-6.3.0.tgz` lists only `package/package.json`, `package/bin.mjs` and `package/LICENSE`; `npm view @marko/create readme | sed -n '/## Options/,$p'` shows `basic` as its only example name and no `--no-install` or `--no-git`, both of which `npx -y create-marko@6.3.0 --help` prints. In a marko-js/examples checkout, `ls examples | grep -v -- -marko-5` prints `app basic library vite-express`.
