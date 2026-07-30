# File-based Routing

Marko Run discovers routes from the file system. The directory structure under the **routes directory**, `./src/routes`, determines the paths an application serves. A small set of `+` prefixed file names determines what happens at each path.

> [!NOTE]
> The `+` prefix makes routable files explicit. Anything without the prefix is ignored by the router, so components, tests, stories, and utilities can be colocated alongside the pages that use them without accidentally being served.

## Routable Files

The router only recognizes certain filenames, all prefixed with `+`. The following filenames will be discovered in any directory inside the application's routes directory.

### `+page.marko`

These files establish a route at the current directory path, which will be served for `GET` requests with the HTML content of the page. Only one page may exist for any served path.

### `+layout.marko`

These files provide a **layout component**, which will wrap all nested layouts and pages.

Layouts are like any other Marko component, with no extra constraints. Each layout receives a `content` input which refers to the nested page or layout being rendered. The [request context](./runtime.md#context) is available as [`$global`](../reference/language.md#global).

```marko
export interface Input {
  content: Marko.Body;
}

<main>
  <h1>My Products</h1>

  // render the nested page or layout here
  <${input.content}/>
</main>
```

### `+handler.*`

These files establish a route at the current directory path that can respond to any HTTP method: exported functions named `GET`, `HEAD`, `POST`, `PUT`, `DELETE`, `PATCH`, or `OPTIONS` handle requests with the matching method.

Typically, these will be `.js` or `.ts` files, depending on the project. Like pages, only one handler file may exist for any served path.

Handlers are created with the global [verb helpers](./validation.md#verb-helpers) (`Run.GET`, `Run.POST`, etc.), which add request validation, typed bodies, and [data loading](./data-loading.md):

```ts
export const POST = Run.POST(async (ctx, next) => {
  const { request, params, url, meta } = ctx;
  return new Response("Successfully updated", { status: 200 });
});
```

Handler functions are synchronous or asynchronous functions that receive two arguments:

- `ctx` contains the WHATWG request object, path parameters, URL, and route metadata (see [Context](./runtime.md#context))
- `next` renders the page for `GET`, `HEAD`, and `POST` requests where applicable, or returns a `204` response. Pass it an object to [make data available](./data-loading.md) to downstream handlers and the page.

A handler function may return (or throw) a WHATWG response, or return `undefined`. If the function returns `undefined`, `next` will be automatically called and used as the response.

```ts
export const GET = Run.GET(async (ctx, next) => {
  // do something before rendering the page
  const response = await next();
  // do something with the response
  return response;
});

export const PUT = Run.PUT((ctx, next) => {
  // `next` will be called automatically since nothing is returned
});

export const DELETE = Run.DELETE((ctx, next) => {
  return new Response("Successfully removed", { status: 204 });
});
```

> [!NOTE]
> When a route has no `HEAD` export, `HEAD` requests are served by the `GET` handler (or page) with the response body stripped.

### `+middleware.*`

These files are like layouts, but for handlers. Middleware files are called before handlers and allow work to be performed before and after them.

Middleware files expect a `default` export with the same shapes as handler exports: a handler function, an array of handler functions, or a promise resolving to either. Middleware is created with `Run.ALL` or a specific verb helper. It may also be options-only, e.g. `Run.ALL({ search: ... })`, to attach [validation](./validation.md) for every route below it without adding behavior.

```ts
export default Run.ALL(async (ctx, next) => {
  const requestName = `${ctx.request.method} ${ctx.url.href}`;
  let success = true;
  console.log(`${requestName} request started`);
  try {
    return await next(); // Wait for subsequent middleware, handler, and page
  } catch (err) {
    success = false;
    throw err;
  } finally {
    console.log(
      `${requestName} completed ${success ? "successfully" : "with errors"}`,
    );
  }
});
```

> [!NOTE]
> Unlike handlers, middleware runs for all HTTP methods. Middleware created with `Run.ALL(...)` runs for every method, while middleware created with a specific verb helper (e.g. `Run.POST(...)`) is skipped for other methods.

### `+meta.*`

These files represent static metadata to attach to the route. This metadata will be automatically provided as `ctx.meta` when the route is invoked. When the file is a non-JSON file, its default export will be used.

Metadata supports verb-specific overrides when it is an object (e.g. a JSON file or `export default { ... }`). Top-level keys that match one of `GET`, `HEAD`, `POST`, `PUT`, `DELETE`, `PATCH`, or `OPTIONS` are shallowly merged into the base object for requests of that method, overriding any existing values. These keys are excluded from the base object, and ignored when their value is not an object. For example, given a `+meta.json` file:

```json
{
  "name": "Default Name",
  "POST": {
    "name": "Post Name",
    "postOnlyData": "foo"
  },
  "GET": {
    "name": "Get Name"
  },
  "PUT": "Ignored"
}
```

for a `POST` request, the value of `ctx.meta` will be

```js
{
  name: "Post Name",
  postOnlyData: "foo"
}
```

for a `GET` request, it will be

```js
{
  name: "Get Name"
}
```

and for all other methods, including `PUT`, it will be the base object

```js
{
  name: "Default Name"
}
```

## Special Files

In addition to the files above, which can be defined in any directory under the routes directory, some special files can only be defined at its top level.

These special pages are subject to a root layout file (`src/routes/+layout.marko` in the default configuration).

### `+404.marko`

This special page responds to any request where:

- The `Accept` request header includes `text/html`
- _And_ no other handler or page rendered the request

Responses with this page will have a `404` status code.

### `+500.marko`

This special page responds to any request where:

- The `Accept` request header includes `text/html`
- _And_ an uncaught error occurs while serving the request

Responses with this page will have a `500` status code.

## Execution Order

Given the following routes directory structure

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

When the path `/about` is requested, the routable files execute in the following order:

1. Middlewares from root-most to leaf-most
2. Handler
3. Layouts from root-most to leaf-most
4. Page

> [!NOTE]
> Layouts and the page are combined at build time into a single component, so nested layouts add no runtime overhead.

## Path Structure

Within the routes directory, the directory structure determines the path from which the route is served. There are four types of directory names: **static**, **pathless**, **dynamic**, and **catch-all**.

### Static Directories

The most common type, and the default behavior. Each static directory contributes its name as a segment in the route's served path, similar to a traditional file server. Unless a directory name matches the requirements for one of the below types, it is seen as a static directory.

Examples:

```text
/foo
/users
/projects
```

### Pathless Directories

These directories do **not** contribute their name to the route's served path. Directory names that start with an underscore (`_`) will be ignored when parsing the route.

Examples:

```text
/_users
/_public
```

### Dynamic Directories

These directories introduce a dynamic parameter to the route's served path and will match any value at that segment. Any directory name that starts with a single dollar sign (`$`) will be a dynamic directory, and the remaining directory name will be the parameter at runtime. If the directory name is exactly `$`, the parameter will not be captured, but it will be matched.

Examples:

```text
/$id
/$name
/$
```

### Catch-all Directories

These directories are similar to dynamic directories and introduce a dynamic parameter, but instead of matching a single path segment, they match to the end of the path. Any directory that starts with two dollar signs (`$$`) will be a catch-all directory, and the remaining directory name will be the parameter at runtime. In the case of a directory named `$$`, the parameter name will not be captured, but it will match. Catch-all directories can be used to make `404` Not Found routes at any level, including the root.

Because catch-all directories match any path segment and consume the rest of the path, route files cannot be nested inside them, and no further directories will be traversed.

Examples:

```text
/$$all
/$$rest
/$$
```

## Flat Routes

Flat routes define paths without needing additional directories. Instead, the directory structure can be defined either in the file or directory name. This allows routes to be decoupled from the directory structure or co-located as needed. To define a flat route, use periods (`.`) to delineate each path segment. This behaves exactly like creating a new directory, and each segment will be parsed using the rules described above for static, dynamic, and pathless routes.

Flat route syntax can be used for both directories and routable files (e.g. pages, handlers, middleware). For these files, anything preceding the plus (`+`) will be treated as the flat route.

For example, to define a page at `/projects/$projectId/members` with a root layout and a project layout:

Without flat routes, the file structure would look like:

```text
routes/
  projects/
    $projectId/
      members/
        +page.marko
      +layout.marko
  +layout.marko
```

With flat routes, move the path defined by the directories into the files and separate with a period

```text
routes/
  +layout.marko
  projects.$projectId+layout.marko
  projects.$projectId.members+page.marko
```

Additionally, files can still be organized under directories to decrease duplication, with flat route syntax in the directory name

```text
routes/
  projects.$projectId/
    +layout.marko
    members+page.marko
  +layout.marko
```

Finally, flat routes and routes defined with directories are all treated equally and merged together. For example, this page will have the layout defined in the nested directories:

```text
routes/
  projects/
    $projectId/
      +layout.marko
  projects.$projectId+page.marko
```

### Multiple Paths

Along with describing multiple segments, flat route syntax supports defining routes that match more than one path. To describe a route that matches multiple paths, use a comma (`,`) and define each route.

For example the following page matches `/projects/$projectId/members` and `/projects/$projectId/people`

```text
routes/
  projects.$projectId.members,projects.$projectId.people+page.marko
```

This file name is a bit long, so a directory can shoulder the shared prefix

```text
routes/
  projects.$projectId/
    members,people+page.marko
```

### Groups

**Grouping** simplifies multiple paths further. Groups define segments within a flat route that match multiple sub-paths by surrounding them with parentheses (`(` and `)`). With a group, the page above collapses back into a single file:

```text
routes/
  projects.$projectId.(members,people)+page.marko
```

This is a basic use of grouping, but groups can be nested and combined as needed.

### Optional Segments

Introducing an empty segment or pathless segment along with another value makes that segment optional. For example, a page that matches both `/projects` and `/projects/home` can be created with a flat route that optionally matches `home`

```text
routes/
  projects.(home,)+page.marko
```

or

```text
routes/
  projects.(home,_pathless)+page.marko
```

While both of these create a route which matches the paths, they have slightly different semantics. Using a pathless segment is the same as creating a pathless directory, which allows middleware and layouts to be isolated. Using an empty segment is the same as defining a file at the current location.

## Escaping Characters

To include a control character (`.`, `,`, `+`, `(`, `)`, `$`, `_`) as a literal in a route path, surround it with backticks (`` ` ``). For example, to create a route served at `/sitemap.xml`:

```text
routes/
  `sitemap.xml`/
    +handler.ts
```

or

```text
routes/
  sitemap`.`xml/
    +handler.ts
```

or

```text
routes/
  sitemap`.`xml+handler.ts
```

## Next Steps

- [TypeScript](./typescript.md)
- [Validation](./validation.md)
- [Data Loading](./data-loading.md)
