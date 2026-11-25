# Data Loading

Handlers and middleware pass server-side data (database queries, sessions, API calls) downstream to nested handlers, layouts, and pages by passing an object to `next(data)`.

## Passing Data

Values passed to `next` are shallowly merged into `ctx.data`, exposed in templates as `$global.data`:

```ts
/* +handler.ts */
export const GET = Run.GET((ctx, next) => {
  return next({ user: loadUser(ctx.params.id) }); // pass the promise directly
});
```

```marko
/* +page.marko */
<await|user|=$global.data.user>
  <h1>Hello ${user.name}</h1>
</await>
```

Root middleware can load shared data (such as the current session) while route handlers add route-specific entries. With [generated types](./typescript.md#generated-types), `$global.data` is typed per route and verb based on the middleware and handlers that actually execute before the template.

> [!WARNING]
> Merging is shallow: passing `{ user: ... }` replaces any upstream `user` entry rather than deep-merging it.

## Promises over Awaiting

Passing promises through `next` and unwrapping them in templates with [`<await>`](../reference/core-tag.md#await) lets responses [stream](../explanation/streaming.md) immediately. Static markup and `<head>` assets reach the browser while data loads, and independent promises resolve in parallel rather than serially.

> [!WARNING]
> Awaiting data in a `GET` handler before calling `next()` blocks the entire response until that promise settles, forfeiting streaming for the whole page.

## Rendering and Responses

`next()` renders the page for `GET`, `POST`, and `QUERY` requests when a `+page.marko` exists, returns `200` (empty body) for `HEAD` when a page exists, and returns `204` when there is no page or for other verbs. Handlers can short-circuit with their own response before calling `next()`:

```ts
export const GET = Run.GET((ctx, next) => {
  if (!ctx.url.searchParams.has("beta")) {
    return ctx.redirect("/request-access");
  }
  return next({ features: loadBetaFeatures() });
});
```

> [!NOTE]
> A handler that always returns its own `Response` never renders the page, so its verb is excluded from the template's generated context union.

## Forms

When a route has both a `+page.marko` and a `POST` handler, respond with one of two patterns depending on the outcome:

- On success, call [`ctx.redirect(url, 303)`](./runtime.md#redirect) ([Post/Redirect/Get](https://en.wikipedia.org/wiki/Post/Redirect/Get)) so the browser lands on a `GET` page that can be refreshed, bookmarked, or shared safely.
- For validation errors or ephemeral responses, return `next({ issues })` to re-render the page inline with feedback while preserving form context.

```ts
/* +handler.ts */
export const POST = Run.POST({ form: parseSignup }, async (ctx, next) => {
  const [signup, issues] = await ctx.body;
  if (issues) {
    return next({ issues }); // re-render form with errors
  }
  await saveSignup(signup);
  return ctx.redirect("/thanks", 303); // Post/Redirect/Get on success
});
```

```marko
/* +page.marko */
<form method="post">
  <if=$global.data.issues>
    <p>Please correct the highlighted fields.</p>
  </if>
  <input name="email" type="email">
  <button>Sign up</button>
</form>
```

> [!WARNING]
> Returning `next()` from a `POST` produces a `POST` response, so refreshing the browser prompts to resubmit. Always redirect after a successful state-changing submission.

## Next Steps

- [Validation](./validation.md#request-bodies)
- [Runtime](./runtime.md#context-methods)
- [Streaming](../explanation/streaming.md)
