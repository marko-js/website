# Performance

Runtime speed and bundle size opportunities. Format and rules: [README.md](README.md).

## Pre-warm overridden marko/@marko/compiler downloads in warm-packages.js

`src/routes/playground/warm-packages.js` | 2026-07-21 | impact:med | effort:med

The inline warm script skips `marko`, `@marko/compiler`, and `@marko/run` (its `seen` set), but when the shared URL's package.json overrides `marko` or `@marko/compiler`, the playground now downloads those tarballs (~2MB for the compiler) plus their dependency tree in `custom-marko.ts` › `loadInstance`, and that fetch only starts after the editor boots. Warming them from the inline script would overlap the download with page startup. The script would need to know the bundled versions to avoid warming the default (wasted bandwidth on every non-override load); one option is interpolating the bundled versions into the raw script in `src/routes/playground/+page.marko`. Re-verify: load a playground URL whose package.json pins `"marko": "6.3.16"` with devtools open; the registry tarball requests start only after the main bundle executes, not during initial HTML parse.
