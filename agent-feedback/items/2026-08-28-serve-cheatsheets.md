---
type: dx
impact: med
effort: low
site: public/llms.txt › ## Reference
---

# Serve the shipped cheatsheets from markojs.com and index them in llms.txt

`marko/packages/runtime-tags/cheatsheet.md` and `run/packages/run/cheatsheet.md` ship inside packages this site already depends on, and the one mention across `public/llms.txt`, `docs/` and `src/` is the July 2026 newsletter sentence announcing that the file exists in the package. The pointers a reader gets instead are node_modules paths: the compiler appends `Fix guide: READ node_modules/marko/cheatsheet.md before writing a fix.` to a compile error under a coding agent, and the generated `.marko-run/routes.d.ts` header names `@marko/run/cheatsheet.md`. The sheets carry rules stated on no docs page: retrying a caught `<try>` by bumping a key on a wrapping `<for>`, `<await>` re-showing its `@placeholder` when handed a new promise in the browser, and `tsc` skipping `.marko` so a type-broken template still exits 0, where `docs/introduction/installation.md` says only to use `mtc` "instead of `tsc`". Serve both files at their own routes through a handler modelled on `src/routes/docs/_llms/reference-full%2emd+handler.ts`, which already reads a file off disk and returns text, and index those routes in `public/llms.txt` › ## Reference; mirror the package files rather than folding their prose into a docs page, since the `<for>` re-key recipe is the kind of workaround the writing guidelines keep out of docs.

Check: `grep -rn -i cheatsheet public/llms.txt docs/ src/` returns only `docs/newsletter/july-2026.md:83`. `curl -sL https://markojs.com/llms.txt | grep -i cheatsheet` is empty and `curl -sL https://markojs.com/docs/reference-full.md | grep -c -i cheatsheet` prints `0`, while `curl -s -o /dev/null -w '%{http_code}' -L` prints `404` for `/docs/cheatsheet.md`, `/cheatsheet`, `/docs/cheatsheet` and `/docs/reference/cheatsheet.md` and `200` for `/llms.txt` and `/docs/reference-full.md` as controls. `grep -rniE 'retry|reset the|recover' docs/ | grep -v newsletter` is empty and `grep -rnw tsc docs/` hits only `docs/introduction/installation.md`.
