---
type: bug
impact: med
effort: low
site: docs/explanation/serializable-state.md › ## Unserializable Data
---

# Fix the `<let/x=null>` examples in serializable-state.md and document how to type a `<let>` tag variable

A `<let>` tag variable takes the exact type of its initial value with no widening, so under `strictNullChecks`, which the default `@marko/run` TypeScript scaffold turns on, `<let/x=null>` is typed `null`: every later assignment is TS2322 and a call is TS2349 on `never`, unlike plain TypeScript where `let x = null` evolves. `docs/explanation/serializable-state.md` ships that form twice. The NOTE under ## Unserializable Data (`<let/handler=null>` then `handler?.(); handler = onSecondClick`) fails `mtc` verbatim, and the ## Shared References example (`<let/muted=null>` then `muted = comment.author`) fails as soon as the surrounding `Input` is typed. Two spellings work and neither is shown anywhere on the site: `<let/x=null as string | null>` and `<let<string | null>/x=null>`, while the annotation form `<let/x:(string | null)=null>` does not, which language-server item 2026-07-18-tag-var-union-annotation.md already covers. Fix both examples and add the typing sentence next to `<let>` in `docs/reference/typescript.md` › ## TypeScript Syntax in `.marko` and `docs/reference/core-tag.md` › ## `<let>`.

Check: in a `@marko/run` scaffold with `@marko/type-check` and `strict: true`, paste the serializable-state.md NOTE verbatim into `src/tags/k73-doc.marko`, add `src/tags/k73-forms.marko` holding `<let/a=null>`, `<let/b=null as string | null>`, `<let<string | null>/c=null>`, `<let/d:(string | null)=null>` and `<button onClick() { a = "x"; b = "x"; c = "x"; d = "x" }>x</button>`, then run `npx mtc`. The docs snippet reports `error TS2349 ... Type 'never' has no call signatures` and `error TS2322 Type '() => void' is not assignable to type 'null'`; of the four forms only `a` and `d` report `error TS2322 Type '"x"' is not assignable to type 'null'`. `<let/handler=null as (() => void) | null>` makes the docs snippet exit 0, and with `"strict": false` the snippet passes, which is why the site's own `pnpm run type-check` (`marko-type-check` over `src/`, not markdown snippets) never saw it.
