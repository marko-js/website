---
type: dx
impact: med
effort: med
site: src/util/workspace.ts › rootDir
---

# Root the playground filesystem at `/` instead of `/app/tags`

The virtual filesystem hangs every user file off `` const rootDir = `${projectDir}/tags/` `` (`projectDir` is `/app`), so paths surface to the user as `app/tags/index.marko`, in the file tabs and inside every compile error's `at ...` location. Neither segment means anything to someone writing a template in the playground: `app` exists only to give `package.json` a home, and `tags/` exists only because the compiler discovers custom tags in a directory named `tags`. Conceptually the files live at the project root, and the compiler can be told so by passing `tagDiscoveryDirs` (or a taglib `taglib-imports`/`tags-dir` entry) naming `/` as a tag directory, the same mechanism `@marko/compiler`'s taglib finder already uses for real projects. Paths would then render as `index.marko`. The blocker is that share links encode file paths: `src/util/hasher.ts` compresses the file list into the URL hash, so shortening the root changes what every existing `#...` link decodes to. Any change needs either a migration that strips a leading `app/tags/` on decode or a hash version bump; `hasher.ts` already distinguishes a `v2` payload, so the versioning hook exists.

Check: open the playground and read the path in a compile error's `at` line, or the tab titles; both read `app/tags/...` today.
