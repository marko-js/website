---
type: bug
impact: med
effort: low
site: docs/marko-run/validation.md › ## Request Bodies
---

# Correct validation.md on `ctx.body` when a body option carries only limits

`docs/marko-run/validation.md` › ## Request Bodies states "With no validator, it resolves to the raw parsed body." @marko/run builds the `ctx.body` thenable only when the route's merged options carry a validator (`packages/run/src/runtime/internal.ts` › `createContext`, guarding on `route.options.json?.validator || route.options.form?.validator`), so an options object holding only limits leaves `ctx.body` `undefined` at runtime and typed exactly `undefined`, and `readBody` counts such an option as contributing limits alone, so once a sibling option supplies a validator the same request is rejected 415. With no validator anywhere the request quietly succeeds with an undefined body and the declared `maxBytes` is never enforced, which is the more dangerous shape because nothing errors. The rest of the ecosystem already states the rule, in run's README, its cheatsheet's identity-validator recipe and the `Context.body` JSDoc, so replace the sentence with the `json: (value) => value` recipe and say that an option carrying only limits does not accept its media type.

Check: in a `@marko/run` app add `src/routes/k75raw/+handler.ts` = `export const POST = Run.POST({ form: { maxBytes: 16_384 } }, async (ctx) => Response.json({ typeofBody: typeof ctx.body, body: (await ctx.body) ?? null }));`, `src/routes/k75id/+handler.ts` with `form: { validator: (value) => value, maxBytes: 16_384 }` and `src/routes/k75mix/+handler.ts` with `json: (value) => value, form: { maxBytes: 16_384 }`, then `npx marko-run build && PORT=4905 node dist/index.mjs`. `curl -X POST -H 'content-type: application/x-www-form-urlencoded' -d 'a=1&b=2'` returns `{"typeofBody":"undefined","body":null}` with HTTP 200 from `/k75raw`, `{"typeofBody":"object","body":{"a":"1","b":"2"}}` with HTTP 200 from `/k75id`, and HTTP 415 from `/k75mix`. Annotating `const probe: string = await ctx.body` in the first route makes `npx mtc` report `error TS2322 Type 'undefined' is not assignable to type 'string'`.
