# Developer Experience

Friction in builds, tests, tooling, or repo workflows. Format and rules: [README.md](README.md).

## Map playground runtime errors back to the user's source

`src/util/workspace.ts` › `onRuntimeError` | 2026-07-27 | impact:med | effort:med

When an `ErrorEvent` carries no `error`, the handler synthesizes an `Error` whose
message appends `ev.filename`, `ev.lineno` and `ev.colno`. Those coordinates
point into the generated bundle, so the playground reports a location such as
`server.js:1,38842`, which is real but names no file the user can open. Build
errors avoid this because marko's `CompileError` frame already names the authored
file, and the error output renders that frame. The workspace keeps sourcemaps for
both the preview modules and the compiled templates, so the position could be
mapped back to the authored file and line before the error is stored, letting
runtime errors render the same code frame as build errors. Re-verify by entering
a template that throws on render, such as calling a string method on a number,
and reading the location shown in the runtime error card.

## Root the playground filesystem at `/` instead of `/app/tags`

`src/util/workspace.ts` › `rootDir` | 2026-07-28 | impact:med | effort:med

The virtual filesystem hangs every user file off `` const rootDir = `${projectDir}/tags/` `` (`projectDir` is `/app`), so paths surface to the user as `app/tags/index.marko` — in the file tabs, and inside every compile error's `at …` location. Neither segment means anything to someone writing a template in the playground: `app` exists only to give `package.json` a home, and `tags/` exists only because the compiler discovers custom tags in a directory named `tags`. Conceptually the files live at the project root, and the compiler can be told so directly by passing `tagDiscoveryDirs` (or a taglib `taglib-imports`/`tags-dir` entry) that names `/` as a tag directory, which is the same mechanism `@marko/compiler`'s taglib finder already uses for real projects. That would let paths render as `index.marko`.

The blocker is that share links encode file paths: `src/util/hasher.ts` compresses the file list into the URL hash, so shortening the root changes what every existing `#…` link decodes to. Any change needs either a migration that rewrites legacy paths on decode (strip a leading `app/tags/`) or a hash version bump — `hasher.ts` already distinguishes a `v2` payload, so the versioning hook exists. Re-verify the current behavior by opening the playground and reading the path in a compile error's `at` line, or the tab titles, which today read `app/tags/…`.
