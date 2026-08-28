---
type: bug
impact: med
effort: low
site: docs/explanation/controllable-components.md › ### Controllable `<let>`
---

# Give the controllable `<counter>` example an optional `count` and a `?? 0` default

The counter.marko block under `docs/explanation/controllable-components.md` › ### Controllable `<let>` declares `count: number` as required and binds `<let/count=input.count valueChange=input.countChange>`, while the parent block on the same page renders a bare `<counter/>` labelled "This one holds its own state". `mtc` rejects that usage with TS2345 (`Property 'count' is missing in type '{}' but required in type 'Input'`), and silencing the error does not rescue it: `input.count` is undefined, so the server renders `Count: ` where the page's own bullet promises the behavior of its first example, and the first click makes it NaN. The shape that keeps the uncontrolled, seeded and controlled usages all valid is `count?: number` with `<let/count=input.count ?? 0 valueChange=input.countChange>`, which type-checks for `<counter/>`, `<counter count=5/>`, `<counter count=parentCount countChange(count) {...}/>` and `<counter count:=parentCount/>`. Note in the section that the explicit handler form is required once a default is involved, since `<let/count:=input.count ?? 0>` is a compile error; `docs/reference/core-tag.md` › ### Controllable Let is self-consistent and needs no change.

Check: copy the two blocks under ### Controllable `<let>` verbatim into a project with `@marko/type-check` 3.2.0 as `src/tags/counter.marko` and `src/parent.marko` and run `npx mtc`: it reports `error TS2345` on `<counter/>` in `src/parent.marko` with `Property 'count' is missing in type '{}' but required in type 'Input'`, unchanged with `strict: false`. In the marko checkout, `pnpm run compile -- -o html -d <parent.marko>` and rendering the result gives `<button>Count: <!>0<!--...--></button><button>Count: <!><!--...--></button>`, the second button carrying no number. With `count?: number` and `?? 0`, `npx mtc` reports nothing for the four usages above, while `<let/count:=input.count ?? 0>` fails `pnpm run compile -- -o dom -d` with "Attributes may only be bound to identifiers or member expressions".
