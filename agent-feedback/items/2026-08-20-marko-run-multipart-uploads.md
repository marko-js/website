---
type: dx
impact: med
effort: med
site: docs/marko-run/validation.md › ### form
---

# Show a worked multipart upload under the `form` option

The `form` option's table is the whole of what the site says about uploads: `maxParts`, `maxFiles`, `maxFileBytes` and `onFile` get one cell each, and `onFile`'s reads `(ctx, file) => any called for each uploaded file`. What a handler actually receives is stated nowhere, and it is the expensive part to rediscover: a multipart field arrives on `await ctx.body` as a `File` carrying an extra `fieldName` property, in the same record as the string fields, and a repeated file field collapses to an array of them exactly as a repeated text field does. No page under `docs/` contains an `<input type="file">`, so there is no path from a form to a stored upload anywhere on the site. An example under the `form` option showing the form markup, the options object and reading the `File` back out of the validated body would cover it; it cannot name `onFile`'s second parameter yet, since `Multipart` is not exported from `@marko/run` (filed in that repo's `agent-feedback/dx.md`).

Check: `grep -rin 'multipart\|onFile' docs/` names only `docs/marko-run/validation.md` and `grep -rn 'type="file"' docs/` returns nothing; both should reach an upload example on the validation page.
