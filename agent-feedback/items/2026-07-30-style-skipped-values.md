---
type: bug
impact: low
effort: low
site: docs/reference/native-tag.md › ### style=
---

# Add `NaN` and `0n` to the values that drop a `style=` declaration

The `style=` section states that a declaration is dropped when its value is `false`, `null`, `undefined`, or an empty string, but `0` is kept. That reads as the complete set and omits `NaN` and bigint `0n`. Marko's runtime writes a declaration only when `value || value === 0` (`stringifyStyleObject` in the marko repo's `packages/runtime-tags/src/common/helpers.ts`, where a bigint never satisfies `0n === 0`), so `<div style={ "line-height": total / count }/>` with a `count` of `0` renders no `line-height` declaration at all rather than the ignored `line-height:NaN` the current wording promises, and a `0n` value disappears the same way while the equivalent attribute still writes `NaN` or `0`. `docs/reference/language.md` already lists all six values under Skipped Values for dynamic text and contrasts them with skipped attributes, so the `style=` sentence should carry the same set and link there. The neighboring `class=` claim needs no change, since a class name is kept only when its value is truthy.

Check: `grep -n "A declaration is dropped" docs/reference/native-tag.md` lists four values against the six in `grep -n "renders nothing" docs/reference/language.md`.
