# Data Loading

Handlers and middleware pass data to everything downstream, including pages and layouts, by calling `next` with an object. This is the primary way a page gets data that requires server-side work: fetching from a database, reading a session, or calling another service.

## Passing Data

Data passed to `next` is shallowly merged into `ctx.data`, which templates access as `$global.data`:

```ts
/* +handler.ts */
export const GET = Run.GET((ctx, next) => {
  return next({ user: loadUser(ctx.params.id) }); // pass the promise itself
});
```

```marko
/* +page.marko */
<await|user|=$global.data.user>
  <h1>Hello ${user.name}</h1>
</await>
```

Each middleware and handler in the chain contributes to the same object. A root middleware can load data shared by every page, like the current session. Handlers then add data specific to their route.

Note that `ctx.data` is populated per route and verb. With [generated types](./typescript.md#generated-types), each file sees the routes and verbs it actually participates in, so the type of `$global.data` in a page or layout reflects exactly the middleware and handlers that run before it.

> [!WARNING]
> The merge is shallow. A handler that passes `{ user: ... }` replaces any `user` value provided upstream instead of merging into it.

## Promises over Awaiting

Notice that the handler above does not `await` the data. Passing the promise and unwrapping it in the template with [`<await>`](../reference/core-tag.md#await) lets the response start [streaming](../explanation/streaming.md) immediately. Static markup, the document `<head>`, and anything else that does not depend on the data reach the browser while the data is still loading. Each `<await>` section then flushes as its promise resolves.

Independent data sources are best kept as separate promises. Two `<await>` sections resolve independently, while awaiting both in a handler serializes them behind one another.

> [!WARNING]
> Avoid awaiting data in a `GET` handler before calling `next`. Every `await` before `next` holds back the entire response until that data resolves. This forfeits streaming and delays even the parts of the page that never needed the data. Pass the promise through `next` and let the template await it instead.

## Rendering and Responses

The `next` function renders the page for `GET`, `HEAD`, and `POST` requests where applicable, or returns a `204` response when there is no page. A handler decides what to do with that result:

```ts
export const GET = Run.GET((ctx, next) => {
  if (!ctx.url.searchParams.has("beta")) {
    return ctx.redirect("/request-access"); // never renders the page
  }
  return next({ features: loadBetaFeatures() });
});
```

> [!NOTE]
> A handler that always returns its own `Response` never renders the page, so its verb is excluded from the template's typed context.

## Forms

When a route has both a page and a `POST` handler, the handler calling `next` renders the page, so form submissions can be answered with HTML directly. A `POST` handler has two ways to respond, and they serve different purposes:

- On success, when the user should move to a new screen or experience, respond with a [redirect](./runtime.md#redirect). This is the [Post/Redirect/Get](https://en.wikipedia.org/wiki/Post/Redirect/Get) pattern. The browser lands on an ordinary `GET` page, so refreshing does not resubmit the form and the URL can be shared or revisited safely.
- Return `next()` to render the page from the `POST` itself. This is useful for rendering validation errors while keeping the submitted form intact, or for an ephemeral page that has no meaning outside this submission.

```ts
/* +handler.ts */
export const POST = Run.POST(
  { form: { validator: parseSignup } },
  async (ctx, next) => {
    const [signup, issues] = await ctx.body;
    if (issues) {
      return next({ issues }); // re-render the form with errors
    }
    await saveSignup(signup);
    return ctx.redirect("/thanks"); // Post/Redirect/Get on success
  },
);
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
> A page rendered by returning `next()` from a `POST` is still a `POST` response. Refreshing it prompts the browser to resubmit the request, and the URL cannot be bookmarked or shared. Reserve it for error re-renders and ephemeral pages. Redirect whenever the submission succeeds and the user moves on.

## Next Steps

- [Validation](./validation.md#request-bodies)
- [Runtime](./runtime.md#context-methods)
- [Streaming](../explanation/streaming.md)
