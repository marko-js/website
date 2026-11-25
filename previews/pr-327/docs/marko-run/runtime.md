# Runtime

At build time, Marko Run compiles [route files](./file-based-routing.md) into a router that creates a **context** object for each request and passes it through middleware, handlers, and templates. [Adapters](./adapters.md) wire this router into deployment targets automatically, or it can be [embedded](#embedding) directly in an existing server.

## Context

Passed as the first argument (`ctx`) to middleware and handlers, and available as [`$global`](../reference/language.md#global) in templates:

| Property   | Description                                                                                                                             |
| :--------- | :-------------------------------------------------------------------------------------------------------------------------------------- |
| `route`    | Matched route path pattern string                                                                                                       |
| `request`  | [WHATWG `Request`](https://developer.mozilla.org/en-US/docs/Web/API/Request) for the incoming request                                   |
| `method`   | HTTP method string                                                                                                                      |
| `url`      | [WHATWG `URL`](https://developer.mozilla.org/en-US/docs/Web/API/URL) for the request                                                    |
| `signal`   | [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) that aborts on client disconnect (`$global.signal`)       |
| `params`   | Path parameters, transformed by any [`params` validator](./validation.md#params-and-search)                                             |
| `search`   | Query string values, transformed by any [`search` validator](./validation.md#params-and-search)                                         |
| `body`     | Lazy promise for the validated body when a [`json` or `form` validator](./validation.md#request-bodies) is configured, else `undefined` |
| `data`     | Values passed downstream via [`next(data)`](./data-loading.md)                                                                          |
| `meta`     | Static metadata from [`+meta`](./file-based-routing.md#meta)                                                                            |
| `platform` | Adapter-specific platform data                                                                                                          |
| `parent`   | Calling context for internal [`ctx.fetch`](#fetch) requests, else `undefined`                                                           |

> [!NOTE]
> `$global.params` and `$global.url` are serialized to the browser by default so client code can read them after resume. Add other properties through `ctx.serializedGlobals` (see [`$global.serializedGlobals`](../reference/template.md#globalserializedglobals)).

## Context Methods

### `fetch`

```ts
fetch(resource: string | URL | Request, init?: RequestInit): Promise<Response>;
```

Dispatches an internal request through the router using the standard [`fetch`](https://developer.mozilla.org/en-US/docs/Web/API/Window/fetch) signature. Relative URLs resolve against `ctx.url`, and the child request's `ctx.parent` points to the caller's context.

### `render`

```ts
render<T>(template: Marko.Template<T>, input: T, init?: ResponseInit): Response;
```

Streams a Marko template as a `Response` (default status `200`, `Content-Type: text/html;charset=UTF-8` unless set in `init.headers`, empty body for `HEAD`).

### `redirect`

```ts
redirect(to: string | URL, status?: number): Response;
```

Returns a redirect response resolving relative paths against `ctx.url`. Defaults to `302`; accepts `301`, `302`, `303`, `307`, or `308`.

### `back`

```ts
back(fallback?: string | URL, status?: number): Response;
```

Redirects to the request's `Referer` header when it shares the **same origin** as `ctx.url`, otherwise falls back to `fallback` (default `"/"`).

## Typed URLs

`Run.href` builds URI-encoded URLs checked against the application's routes at compile time when [generated types](./typescript.md#generated-types) are enabled:

```marko
<a href=Run.href("/projects/$projectId/members", {
  params: { projectId: 42 },
  search: { sort: "name" },
  hash: "top",
})>
  Members
</a>
```

| Option   | Description                                                                                                                            |
| :------- | :------------------------------------------------------------------------------------------------------------------------------------- |
| `params` | Values for [dynamic segments](./file-based-routing.md#path-structure); required when present; `$$` also accepts arrays joined with `/` |
| `search` | Query string values, typed against the route's [`search` validator](./validation.md#params-and-search) when declared                   |
| `hash`   | Fragment appended after `#`                                                                                                            |

> [!NOTE]
> In client builds, Marko Run compiles direct `Run.href(...)` calls away when statically analyzable. Call `Run.href` directly in browser code rather than aliasing or destructuring `Run`.

## Embedding

Import `@marko/run/router` directly to embed routing inside a custom server:

```ts
import * as router from "@marko/run/router";
```

### `router.fetch`

```ts
function fetch(request: Request, platform: unknown): Promise<Response | void>;
```

Executes the matched route for a [WHATWG `Request`](https://developer.mozilla.org/en-US/docs/Web/API/Request) with `platform` exposed as `ctx.platform`. Returns:

- a [WHATWG `Response`](https://developer.mozilla.org/en-US/docs/Web/API/Response) from the matched route
- `undefined` if the route exited unhandled (`throw null`)
- a `404` response if no route matched
- a `500` response if an uncaught error occurred

```ts
import express from "express";
import * as router from "@marko/run/router";

express()
  .use(async (req, res, next) => {
    const request = createWHATWGRequest(req);
    const response = await router.fetch(request, { req, res });

    if (response) {
      applyResponse(response, res);
    } else {
      next();
    }
  })
  .listen(3000);
```

> [!TIP]
> For Express and Connect-style Node.js servers, the [Node adapter's middleware](./adapters.md#node) handles request/response conversion automatically.

### `router.match`

```ts
function match(method: string, pathname: string): RouteMatch | null;
```

Synchronously matches an HTTP method and pathname, returning a `RouteMatch` (`params`, `meta`, `path`, `handler`, `options`) or `null` when unmatched.

### `router.invoke`

```ts
function invoke(
  route: RouteMatch | null,
  request: Request,
  platform: unknown,
  url?: URL,
): Promise<Response | void>;
```

Executes a `RouteMatch` returned by [`router.match`](#routermatch) (passing `null` triggers 404 handling), letting custom middleware inspect route metadata between matching and invocation:

```ts
import express from "express";
import * as router from "@marko/run/router";

express()
  .use((req, res, next) => {
    res.locals.match = router.match(req.method, req.path);
    next();
  })
  // middleware that inspects `res.locals.match`
  .use(async (req, res, next) => {
    if (!res.locals.match) {
      next();
      return;
    }

    const request = createWHATWGRequest(req);
    const response = await router.invoke(res.locals.match, request, { req, res });

    if (response) {
      applyResponse(response, res);
    } else {
      next();
    }
  })
  .listen(3000);
```

## Next Steps

- [Vite Plugin](./vite-plugin.md)
- [Adapters](./adapters.md)
- [TypeScript](./typescript.md)
