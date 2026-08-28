---
type: dx
impact: med
effort: low
site: docs/reference/custom-tag.md › ## Installed Custom Tags
---

# Document that a tag library's package.json `exports` map must expose the directory its marko.json names

A tag discovered through an installed package's `marko.json` is imported by the bare specifier `<packageName>/<path relative to the package root>`, for example `@acme/ui/dist/tags/acme-icon/index.marko`. That is deliberate since compiler #3418 and #3501, so a pnpm virtual-store realpath is never emitted, and the specifier carries the file's on-disk location rather than any alias the library declares. A library that ships a package.json `exports` map therefore has to expose the directory its `marko.json` `exports` key names (`"./dist/*": "./dist/*"`); the library's own `"./tags/*": "./dist/tags/*/index.marko"` alias does not satisfy it. Without that entry the consumer compiles clean and then fails in the bundler on an import nobody wrote, with no template path, tag name or `marko.json` in the message. State the requirement on `docs/reference/custom-tag.md` › ## Installed Custom Tags beside the `marko.json` `"exports"` key, and on `docs/guide/publishing-components.md`, which currently has headings and no body.

Check: in a consumer of a tag library whose `marko.json` is `{"exports": "./dist/tags"}` and whose package.json `exports` map has no entry covering `./dist/*`, and whose templates use the library only through tag discovery, `node -e 'const {compileSync}=require("@marko/compiler");const r=compileSync("<acme-icon name=\"x\"/>",require("path").resolve("src/probe.marko"),{output:"html"});console.log(r.code.split("\n").filter(l=>l.includes("acme")).join("\n"))'` prints `import _acmeIcon from "@acme/ui/dist/tags/acme-icon/index.marko";` with `diagnostics: []`. `npx vite build --app` then fails with `[rolldown:vite-resolve] "./dist/tags/acme-icon/index.marko" is not exported under the conditions ["module", "node", "production", "import"] from package .../node_modules/@acme/ui`, and `npx vite` plus `curl localhost:<port>/` returns 500 with the same message. Adding `"./dist/*": "./dist/*"`, or deleting the `exports` field, makes both pass; `npx mtc` exits 0 either way.
