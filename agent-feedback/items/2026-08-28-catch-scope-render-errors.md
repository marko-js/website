---
type: dx
impact: med
effort: low
site: docs/reference/core-tag.md › ### `@catch`
---

# Scope `@catch` to errors thrown while rendering the `<try>` content

`docs/reference/core-tag.md` › ### `@catch` says "When a runtime error occurs in the content of the `<try>` or its `@placeholder` attribute tag, the content is replaced", which a reader takes to include the event handlers and effects written in that content. The runtime scopes it to the render path: marko `dom/catch.feat.ts` wraps `runRender` alone, with a comment recording that an error thrown from a `<script>` or `<lifecycle>` body deliberately escapes the flush, and `dom/event.ts` › `handleDelegated` invokes handlers bare. Clicking a `<button onClick() { throw new Error("event boom") }>` inside a `<try>` leaves `@catch` unrendered, leaves the sibling content in place and surfaces one uncaught page error; a `<script>` that throws behaves the same on its first mount and on an update, while a throw during render, initial or on update, and a rejected `<await>` are both caught. Restate the section as the positive rule, that `@catch` covers errors thrown while rendering the content including a rejected `<await>`, and point handler and effect errors at the ordinary window error path.

Check: mount `<try><widget mode=mode/><@catch|err|><div class="caught">caught: ${err.message}</div></@catch></try>`, where widget is `<const/status=health(input.mode)><div class="status">Status: ${status}</div><button onClick() { throw new Error("event boom") }>Poke</button>` and `health` throws for `mode === "render"`. Clicking Poke gives `{ caughtCount: 0, status: "Status: healthy", pageErrors: ["event boom"] }`; flipping `mode` to `"render"` gives `{ caughtCount: 1, caughtText: "caught: render boom", statusCount: 0 }`; a `<try>`-wrapped child whose `<script>` throws gives `{ caughtCount: 0, errs: ["effect boom"] }` with its sibling content still rendered; `<try><await|v|=Promise.reject(new Error("await boom"))>` renders `@catch` with an empty `pageErrors`.
