---
type: dx
impact: high
effort: low
site: docs/marko-run/file-based-routing.md › # File-based Routing
---

# Document where a file served at a fixed URL belongs

Nothing across the nine `docs/marko-run/*.md` pages says how an application serves a file at a fixed path, so `<link rel="icon" href="/favicon.png">` in a root layout is the plausible first guess and it 404s in production. `src/routes` is a route directory, not a static root: a `favicon.png` sitting beside `+page.marko` never reaches the build output, and the build reports nothing. Vite's public directory is the mechanism, and Marko Run already wires it up, setting `build.copyPublicDir` for the client pass in `packages/run/src/vite/plugin.ts` and serving the client output directory from `serve-static` in its default entry, so `public/favicon.png` builds to `dist/public/favicon.png` and answers at `/favicon.png`. A short Static Assets section naming `public/` and stating that `src/routes` holds only routable files closes it.

Check: `grep -rin 'publicDir\|favicon\|static asset' docs/` returns nothing today and should name `public/`; a built app with `src/routes/favicon.png` answers `GET /favicon.png` with 404 while the same file under `public/` answers 200 `image/png`.
