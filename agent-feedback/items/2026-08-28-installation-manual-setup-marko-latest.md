---
type: bug
impact: high
effort: low
site: docs/introduction/installation.md › ## Manual Setup
---

# Point installation.md's manual setup at `npm install marko`, not `marko@next`

`docs/introduction/installation.md` › ## Manual Setup tells a newcomer to run `npm install marko@next` on its Install Marko step. Since marko 6.1.9 (#3223, "Release marko@5 as `m5` dist-tag and marko@6 as `latest` dist-tag") the release script publishes `marko` to `latest` and `m5` only, so the `next` dist-tag is frozen at 6.1.8 while `latest` is 6.3.46, and the first manual-setup step installs a runtime two minor lines behind the one the rest of the site documents (no assets and lazy loading, no sync `<await>`, none of the 6.2 or 6.3 changes). The site already states the current rule elsewhere: `docs/newsletter/june-2026.md` › ## Latest on npm says "The `marko` package is tagged `latest` on npm, so `npm install marko` brings in the Tags API runtime". Change the line to `npm install marko`.

Check: `grep -rn '@next' docs` prints one line, `docs/introduction/installation.md:52:   npm install marko@next`; `npm view marko dist-tags --json` prints `{"m3":"3.14.4","m2":"2.11.3","m4":"4.28.10","next":"6.1.8","m5":"5.39.38","latest":"6.3.46"}` and `npm view marko@next version` prints `6.1.8`.
