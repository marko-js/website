# Runtime

At build time, Marko Run generates a router from the application's [route files](./file-based-routing.md). For each request, the router creates a **context** object that flows through middleware, handlers, and templates. When using an [adapter](./adapters.md), the runtime is abstracted away. It can also be [embedded](#embedding) in an existing server.

## Context

The context is passed to middleware and handler functions as the first parameter, conventionally named `ctx`. In Marko templates, it is available as [`$global`](../reference/language.md#global). It contains information about the current request:

| Property   | Description                                                                                                                                      |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `route`    | A string identifying the current route's path pattern                                                                                            |
| `request`  | The current [WHATWG `Request`](https://developer.mozilla.org/en-US/docs/Web/API/Request) instance                                                |
| `method`   | HTTP method of the current request                                                                                                               |
| `url`      | [WHATWG `URL`](https://developer.mozilla.org/en-US/docs/Web/API/URL) instance of the current request                                             |
| `params`   | The route's path parameters, transformed by any [`params` validators](./validation.md#params-and-search)                                         |
| `search`   | The request's query string values, transformed by any [`search` validators](./validation.md#params-and-search)                                   |
| `body`     | Promise for the parsed request body when the route configures a [`json` or `form` option](./validation.md#request-bodies), otherwise `undefined` |
| `data`     | Data passed from upstream middleware and handlers via [`next(data)`](./data-loading.md)                                                          |
| `meta`     | Metadata loaded from the current route's [`+meta` file](./file-based-routing.md#meta)                                                            |
| `platform` | Additional data provided by the [adapter](./adapters.md)                                                                                         |
| `parent`   | The calling context when the request was made with [`ctx.fetch`](#fetch), otherwise `undefined`                                                  |

> [!NOTE]
> In templates, `$global.params` and `$global.url` are serialized to the browser by default, so client-side code can read them after hydration. Other context properties can be included by setting them in `ctx.serializedGlobals`.

## Context Methods

The context also provides helpers for producing responses.

### `fetch`

```ts
fetch(resource: string | URL | Request, init?: RequestInit): Promise<Response>;
```

Creates a response by making a new request to the router. This method has the same signature as native [`fetch`](https://developer.mozilla.org/en-US/docs/Web/API/Window/fetch). Relative URLs resolve against the current request's URL, and the new request's context has this context as its `parent`.

### `render`

```ts
render<T>(template: Marko.Template<T>, input: T, init?: ResponseInit): Response;
```

Creates a response that streams the given Marko template and sets the `Content-Type` header to `text/html`.

### `redirect`

```ts
redirect(to: string | URL, status?: number): Response;
```

Creates a redirect response, resolving relative paths against the current URL. The status defaults to `302` and must be one of `301`, `302`, `303`, `307`, or `308`.

### `back`

```ts
back(fallback?: string | URL, status?: number): Response;
```

Creates a redirect response that uses the current request's `Referer` header, or the fallback (default `/`) when there is none.

## Typed URLs

The runtime also provides `Run.href`, which builds URLs for the application's routes with type checking of the path, params, search, and hash. The path is typed against the routes the application actually serves. Renaming or moving a route turns every stale link into a compile-time error instead of a broken `<a>` tag.

```marko
<a href=Run.href("/projects/$projectId/members", {
  params: { projectId: 42 },
  search: { sort: "name" },
  hash: "top",
})>Members</a>
```

| Option   | Description                                                                                                                                                                             |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `params` | Values for the path's [dynamic segments](./file-based-routing.md#path-structure). Required exactly when the path has them. Catch-all (`$$`) params also accept arrays, joined with `/`. |
| `search` | Query string values. When the route declares a [`search` validator](./validation.md#params-and-search), the keys are typed against it.                                                  |
| `hash`   | Fragment appended after `#`.                                                                                                                                                            |

All params, search values, and the hash are URI-encoded automatically.

The full path checking relies on [generated types](./typescript.md#generated-types), so a TSConfig file must be present in the project root for `Run.href` to validate paths and params at compile time. The function still builds correct URLs without it.

> [!TIP]
> In client builds, Marko Run's Vite plugin rewrites statically analyzable `Run.href(...)` calls at compile time, so most calls cost nothing at runtime.

## Embedding

When more control is needed than an [adapter](./adapters.md) provides, the router can be imported directly and embedded in an existing server:

```ts
import * as router from "@marko/run/router";
```

### `router.fetch`

```ts
function fetch(request: Request, platform: unknown): Promise<Response | void>;
```

This asynchronous function takes a [WHATWG `Request`](https://developer.mozilla.org/en-US/docs/Web/API/Request) and an object containing any platform-specific data made available as `ctx.platform`. It returns any of

- a [WHATWG `Response`](https://developer.mozilla.org/en-US/docs/Web/API/Response) generated from executing the matched route files
- `undefined` if the request was not explicitly handled
- a `404` status response if no route matches the requested path
- a `500` status response if an uncaught error occurs

Express example:

```ts
import express from "express";
import * as router from "@marko/run/router";

express()
  .use(async (req, res, next) => {
    const request = createWHATWGRequest(req); // code to create a WHATWG Request from `req`

    const response = await router.fetch(request, { req, res });

    if (response) {
      applyResponse(response, res); // code to apply a WHATWG Response to `res`
    } else {
      next();
    }
  })
  .listen(3000);
```

> [!TIP]
> When targeting Node.js servers, the [Node adapter's middleware](./adapters.md#node) already performs this request and response conversion for Connect-style servers like Express.

### `router.match`

```ts
function match(method: string, pathname: string): Route | null;
```

This synchronous function takes an HTTP method and path name. It returns an object representing the best matching route (`params` and `meta`), or `null` if no route matches. This is useful when other parts of a server need to know whether a route exists before creating a response.

### `router.invoke`

```ts
function invoke(
  route: Route,
  request: Request,
  platform: unknown,
): Promise<Response | void>;
```

This asynchronous function takes a route object returned by [`router.match`](#routermatch), along with the request and platform data. It produces a response in the same way [`router.fetch`](#routerfetch) does. Together, `match` and `invoke` split `fetch` into its two steps so that other middleware can run in between:

```ts
import express from "express";
import * as router from "@marko/run/router";

express()
  .use((req, res, next) => {
    req.match = router.match(req.method, req.path);
    next();
  })

  // ...other middleware which can check `req.match`

  .use(async (req, res, next) => {
    if (!req.match) {
      next();
      return;
    }

    const request = createWHATWGRequest(req); // code to create a WHATWG Request from `req`
    const response = await router.invoke(req.match, request, { req, res });

    if (response) {
      applyResponse(response, res); // code to apply a WHATWG Response to `res`
    } else {
      next();
    }
  })
  .listen(3000);
```

## Next Steps

- [Data Loading](./data-loading.md)
- [Adapters](./adapters.md)
- [TypeScript](./typescript.md)
