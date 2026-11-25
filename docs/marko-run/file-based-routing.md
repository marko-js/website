# File-based Routing

Marko Run maps the directory tree under `./src/routes` to URL paths using a small set of `+`-prefixed filenames.

> [!NOTE]
> Only `+`-prefixed files are treated as routes. Components, tests, stories, and utilities without a `+` prefix can live beside the routes that use them without becoming endpoints.

## Routable Files

### `+page.marko`

Defines the page rendered at the directory's path for `GET` and `HEAD` requests (and for `POST` or `QUERY` requests when a handler invokes `next()`). At most one page may exist per served path.

### `+layout.marko`

Wraps all nested layouts and pages under its directory. Layouts are standard Marko components receiving `input.content` (the nested layout or page) and the [request context](./runtime.md#context) as [`$global`](../reference/language.md#global):

```marko
export interface Input {
  content: Marko.Body;
}

<main>
  <h1>Products</h1>
  <${input.content}/>
</main>
```

### `+handler.*`

Handles HTTP requests at the directory's path via named exports for any HTTP verb: `GET`, `HEAD`, `POST`, `PUT`, `DELETE`, `PATCH`, `OPTIONS`, or `QUERY`. Each export may be a handler function, an array of handler functions, or a promise resolving to either. At most one handler file (`.js` or `.ts`) may exist per served path.

Create handlers with the global [verb helpers](./validation.md#verb-helpers) (`Run.GET`, `Run.POST`, etc.) for typed validation and [data loading](./data-loading.md):

```ts
export const POST = Run.POST({ json: ReminderSchema }, async (ctx) => {
  const [reminder, issues] = await ctx.body;
  if (issues) {
    return Response.json({ issues }, { status: 422 });
  }
  await saveReminder(ctx.params.listId, reminder);
  return Response.json(reminder, { status: 201 });
});
```

Handlers receive `(ctx, next)`:

- `ctx`: the request context (WHATWG `Request`, `params`, `search`, `body`, `data`, `meta`, `url`, `signal`; see [Context](./runtime.md#context))
- `next`: renders the page for `GET`, `POST`, and `QUERY` requests (returning `200` with an empty body for `HEAD` when a page exists, or `204` when there is no page or for other verbs). Pass an object to `next(data)` to [load data](./data-loading.md) for downstream handlers and pages.

> [!TIP]
> Configure [`json` or `form` validation](./validation.md#request-bodies) and read `await ctx.body` rather than calling `ctx.request.json()` or `ctx.request.formData()`, which bypasses validation and size limits.

A handler may return (or throw) a `Response`, return `undefined` (which invokes `next()` automatically), return `null` (falling through to `404`), or `throw null` (exiting the router as unhandled so downstream server middleware can take over):

```ts
export const GET = Run.GET(async (ctx, next) => {
  const response = await next();
  return response;
});

export const PUT = Run.PUT(() => {
  // Returning undefined invokes `next()` automatically
});

export const DELETE = Run.DELETE(() => {
  return new Response(null, { status: 204 });
});
```

> [!NOTE]
> When no `HEAD` export exists, `HEAD` requests run the `GET` handler (or page) with the response body stripped.

### `+middleware.*`

Runs before nested middleware and handlers in its directory subtree. Middleware uses a `default` export accepting the same shapes as handler exports (function, array, or promise) created with `Run.ALL` or a verb helper. An options-only call such as `Run.ALL({ search: ... })` attaches shared [validation](./validation.md) without adding handler logic:

```ts
export default Run.ALL(async (ctx, next) => {
  const label = `${ctx.request.method} ${ctx.url.href}`;
  let ok = true;
  console.log(`${label} started`);
  try {
    return await next();
  } catch (err) {
    ok = false;
    throw err;
  } finally {
    console.log(`${label} ${ok ? "succeeded" : "failed"}`);
  }
});
```

> [!NOTE]
> `Run.ALL(...)` middleware runs for every HTTP method; verb-specific middleware runs only for that verb (`Run.GET(...)` middleware also runs for `HEAD`).

### `+meta.*`

Attaches static metadata to a route, exposed as `ctx.meta` (JSON files or a JS/TS module's `default` export). When the metadata is an object, top-level keys matching an HTTP verb (`GET`, `HEAD`, `POST`, `PUT`, `DELETE`, `PATCH`, `OPTIONS`, `QUERY`) whose value is an object are shallowly merged into the base object for that method and excluded from all other methods (non-object verb values are ignored):

```json
{
  "name": "Default Name",
  "POST": { "name": "Post Name", "postOnlyData": "foo" },
  "GET": { "name": "Get Name" },
  "PUT": "Ignored"
}
```

With this `+meta.json`, `ctx.meta` resolves as follows:

- `POST`:

  ```js
  { name: "Post Name", postOnlyData: "foo" }
  ```

- `GET`:

  ```js
  { name: "Get Name" }
  ```

- `PUT` and all other methods:

  ```js
  { name: "Default Name" }
  ```

## Special Files

Defined only at the top level of the routes directory (`src/routes/`). Special pages are wrapped by the root `+layout.marko` (root `+middleware.*` does not run for them).

### `+404.marko`

Renders with status `404` when the `Accept` header includes `text/html` and no route handled the request.

### `+500.marko`

Renders with status `500` when the `Accept` header includes `text/html` and an uncaught error occurs. Receives `input.error` (`unknown`).

## Static Assets

Files served at fixed URLs (such as `/favicon.png` or `/robots.txt`) belong in the project's `public/` directory (Vite's `publicDir`), not `src/routes/`. Files in `public/` are copied directly into `dist/public/` at build time and served from `/` by the default server.

## Execution Order

Given:

```text
routes/
  about/
    +handler.js
    +layout.marko
    +middleware.js
    +page.marko
  +layout.marko
  +middleware.js
  +page.marko
```

A request to `/about` runs in order:

1. Middleware from root to leaf
2. Route handler
3. Layouts from root to leaf
4. Page

> [!NOTE]
> Layouts and pages combine into a single template at build time, adding zero runtime nesting overhead.

## Path Structure

Directory names under `src/routes/` fall into four kinds:

### Static Directories

Any ordinary directory name contributes that literal segment to the URL:

```text
/foo
/users
/projects
```

### Pathless Directories

Names starting with `_` group routes, layouts, or middleware without adding a URL segment:

```text
/_users
/_public
```

### Dynamic Directories

Names starting with `$` match a single path segment and capture its value in `ctx.params`. A bare `$` matches one segment without capturing it:

```text
/$id
/$name
/$
```

### Catch-all Directories

Names starting with `$$` match the remainder of the path and capture it in `ctx.params`; bare `$$` matches without capturing. Catch-all directories can also build 404 routes at any level, including the root. Nested routes inside a catch-all directory are not supported:

```text
/$$all
/$$rest
/$$
```

## Flat Routes

Flat routes encode path segments in file or directory names using `.` as a separator (anything before `+` in a routable filename is parsed with the same static, pathless, dynamic, and catch-all rules).

Directory-based and flat layouts can be mixed freely and merge into the same route tree. These two structures both define `/projects/$projectId/members` with root and project layouts:

```text
routes/
  projects/
    $projectId/
      members/
        +page.marko
      +layout.marko
  +layout.marko
```

```text
routes/
  +layout.marko
  projects.$projectId+layout.marko
  projects.$projectId.members+page.marko
```

Shared prefixes can also stay in a flat directory:

```text
routes/
  projects.$projectId/
    +layout.marko
    members+page.marko
  +layout.marko
```

### Multiple Paths

Separate multiple paths with `,` so one file serves several routes (`/projects/$projectId/members` and `/projects/$projectId/people`):

```text
routes/
  projects.$projectId/
    members,people+page.marko
```

### Groups

Parentheses group alternating sub-paths within a single flat filename (and may be nested):

```text
routes/
  projects.$projectId.(members,people)+page.marko
```

### Optional Segments

Pair a segment with an empty or pathless alternative to make it optional (matching both `/projects` and `/projects/home`):

```text
routes/
  projects.(home,)+page.marko
```

```text
routes/
  projects.(home,_pathless)+page.marko
```

An empty alternative behaves like defining the file at the parent directory, while a pathless alternative isolates middleware and layouts like a pathless directory.

## Escaping Characters

Wrap control characters (`.`, `,`, `+`, `(`, `)`, `$`, `_`) in backticks (`` ` ``) to match them literally in a URL, such as `/sitemap.xml`:

```text
routes/
  `sitemap.xml`+handler.ts
```

Or escape individual characters:

```text
routes/
  sitemap`.`xml+handler.ts
```

## Next Steps

- [TypeScript](./typescript.md)
- [Validation](./validation.md)
- [Data Loading](./data-loading.md)
