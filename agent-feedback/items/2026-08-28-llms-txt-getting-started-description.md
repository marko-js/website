---
type: dx
impact: low
effort: low
site: public/llms.txt › ## Introduction
---

# Retire the inherited "Quick start guide" llms.txt description for getting-started.md

`public/llms.txt` › ## Introduction indexes `docs/introduction/getting-started.md` as "Quick start guide for new projects", but that page is the Marko 6 version note, one orientation paragraph, ## Prerequisite Knowledge and ## Next Steps; the create command lives on `docs/introduction/installation.md` and `docs/marko-run/getting-started.md`. The description was inherited rather than written for the page: commit ec6e95618 moved the entry from the Marko Run quick start, which does carry `npm init marko`, kept the old text, and gave the new Marko Run entry its own "Quick start for Marko Run". The page is also the docs landing page, since `src/routes/docs/+handler.ts` redirects `/docs` to it and the home CTA links there, so the stale line is the index's first Introduction entry. Reword it to describe orientation and prerequisites, or put the create command on the page.

Check: `grep -c 'npm init marko' docs/introduction/getting-started.md` prints `0` while `grep -n 'Getting Started' public/llms.txt` prints `32:- [Getting Started](/docs/introduction/getting-started.md): Quick start guide for new projects` beside `79:- [Getting Started](/docs/marko-run/getting-started.md): Quick start for Marko Run`. `git log -S 'introduction/getting-started.md): Quick start guide for new projects' -- public/llms.txt` returns ec6e95618, whose diff moves the link and leaves the description untouched.
