# Performance

Runtime speed and bundle size opportunities. Format and rules: [README.md](README.md).

## Skip the contributors fetch for non-page routes under `/docs`

`src/routes/docs/+middleware.ts` › `Run.ALL` | 2026-07-28 | impact:low | effort:low

The middleware runs for every route under `/docs`, including the
`reference-full.md` and `newsletter/feed.xml` handlers and the `/docs`
redirect. Those never render `docs/+layout.marko`, so the GitHub API call they
trigger is always wasted, and each one asks for a path that cannot exist
(`docs/newsletter/feed.xml.md`). It matters because the unauthenticated rate
limit is 60 requests an hour and a full static build already issues one per
docs page, so the wasted calls eat headroom a local or fork build needs.
Re-verify by adding a `console.log(route)` to the middleware and running
`npm run build`: the handler routes appear alongside the 51 doc pages.
