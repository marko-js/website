# File-based Routing

## Routes Directory

The plugin looks for route files in the configured **routes directory**. By default, this is set to `./src/routes` relative to the Vite config file. This directory contains all the routing logic for the application.

Here's how to configure a different routes directory:

```ts
/* vite.config.ts */
import { defineConfig } from "vite";
import marko from "@marko/run/vite";

export default defineConfig({
  plugins: [
    marko({
      routesDir: "src/pages", // Use `./src/pages` (relative to this file) as the routes directory
    }),
  ],
});
```

## Routable Files

The router only recognizes certain filenames, all prefixed with `+`. The following filenames will be discovered in any directory inside your application’s [routes directory](#routes-directory).

### `+page.marko`

These files establish a route at the current directory path which will be served for `GET` requests with the HTML content of the page. Only one page may exist for any served path.

### `+layout.marko`

These files provide a **layout component**, which will wrap all nested layouts and pages. Information is obtained from [`$global`](../reference/language.md#global) and `input`
Layouts are like any other Marko component, with no extra constraints. Each layout receives the request, path params, URL, and route metadata as input, as well as a `content` which refers to the nested page that is being rendered.

```marko
<main>
  <h1>My Products</h1>

  <${input.content}/> // render the page or layout here
</main>
```

### `+handler.*`

These files establish a route at the current directory path which can handle requests for `GET`, `POST`, `PUT`, and `DELETE` HTTP methods. <!-- TODO: what about HEAD? -->

Typically, these will be `.js` or `.ts` files depending on your project. Like pages, only one handler for each method may exist for any served path. A handler should export functions

- Valid exports are functions named `GET`, `POST`, `PUT`, or `DELETE`.
- Exports can be one of the following
  - Handler function (see below)
  - Array of handler functions - will be composed by calling them in order
  - Promise that resolves to a handler function or array of handler functions
- Handler functions are synchronous or asynchronous functions that

  - Receives a `context` and `next` argument,
    - The `context` argument contains the WHATWG request object, path parameters, URL, and route metadata.
    - The `next` argument will call the page for `GET` requests where applicable or return a `204` response.
  - Return a WHATWG response, throw a WHATWG response, and return undefined. If the function returns undefined the `next` argument with be automatically called and used as the response.

    ```js
    export function POST(context, next) {
      const { request, params, url, meta } = context;
      return new Response("Successfully updated", { status: 200 });
    }

    export async function GET(context, next) {
      // do something before calling `next`
      const response = await next();
      return response;
    }
    ```

### `+middleware.*`

These files are like layouts, but for handlers. Middleware files are called before handlers and let you perform arbitrary work before and after.

> [!NOTE]
> Unlike handlers, middleware run for all HTTP methods.

- Expects a `default` export that can be one of the following
  - Handler function (see below)
  - Array of handler functions - will be composed by calling them in order
  - Promise that resolves to a handler function or array of handler functions
- Handler functions are synchronous or asynchronous functions that

  - Receives a `context` and `next` argument,
    - The `context` argument contains the WHATWG request object, path parameters, URL, and route metadata.
    - The `next` argument will call the page for `GET` requests where applicable or return a `204` response.
  - Return a WHATWG response, throw a WHATWG response, and return undefined. If the function returns undefined the `next` argument with be automatically called and used as the response.

    ```ts
    export default async function (context, next) {
      const requestName = `${context.request.method} ${context.url.href}`;
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
    }
    ```

### `+meta.*`

These files represent static metadata to attach to the route. This metadata will be automatically provided on the route `context` when invoking a route.

## Special Files

In addition to the files above which can be defined in any directory under the [routes directory](#routes-directory), some special files can only be defined at its top level. <!-- TODO: do we want to keep this restriction? Having nested 404s would be handy for disambiguating things like “there’s no user with that name” or “that promotion wasn’t found, it may have expired” -->

These special pages are subject to a root layout file (`pages/+layout.marko` in the default configuration).

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

```fs
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

<!-- mermaid diagram from README -->

## Path Structure

Within the [routes directory](#routes-directory), the directory structure determines the path from which the route is served. There are four types of directory names: **static**, **pathless**, **dynamic**, and **catch-all**.

1. **Static directories** - The most common type, and the default behavior. Each static directory contributes its name as a segment in the route's served path, like a traditional fileserver. Unless a directory name matches the requirements for one of the below types, it is seen as a static directory.

   Examples:

   ```fs
   /foo
   /users
   /projects
   ```

2. **Pathless directories** - These directories do **not** contribute their name to the route's served path. Directory names that start with an underscore (`_`) will be ignored when parsing the route.

   Examples:

   ```fs
   /_users
   /_public
   ```

3. **Dynamic directories** - These directories introduce a dynamic parameter to the route's served path and will match any value at that segment. Any directory name that starts with a single dollar sign (`$`) will be a dynamic directory, and the remaining directory name will be the parameter at runtime. If the directory name is exactly `$`, the parameter will not be captured but it will be matched.

   Examples:

   ```fs
   /$id
     /$name
   /$
   ```

4. **Catch-all directories** - These directories are similar to dynamic directories and introduce a dynamic parameter, but instead of matching a single path segment, they match to the end of the path. Any directory that starts with two dollar signs (`$$`) will be a catch-all directory, and the remaining directory name will be the parameter at runtime. In the case of a directory named `$$`, the parameter name will not be captured but it will match. Catch-all directories can be used to make `404` Not Found routes at any level, including the root.

   Because catch-all directories match any path segment and consume the rest of the path, you cannot nest route files in them and no further directories will be traversed.

   Examples:

   ```fs
   /$$all
     /$$rest
   /$$
   ```

## Flat Routes

Flat routes let you define paths without needing additional directories. Instead the directory structure can be defined either in the file or directory name. This allows you to decouple your routes from your directory structure or co-locate them as needed. To define a flat route, use periods (`.`) to delineate each path segment. This behaves exactly like creating a new directory and each segment will be parsed using the rules described above for static, dynamic and pathless routes.

Flat routes syntax can be used for both directories and routable files (eg. pages, handlers, middleware, etc.). For these files, anything proceeding the plus (`+`) will be treated as the flat route.

For example to define a page at `/projects/$projectId/members` with a root layout and a project layout:

Without flat routes you would have a file structure like:

```fs
routes/
  projects/
    $projectId/
    $members/
      +page.marko
        +layout.marko
        +layout.marko
```

With flat routes move the path defined by the directories into the files and separate with a period

```fs
routes/
  +layout.marko
  projects+layout.marko
  projects.$projectId.members+page.marko
```

Additionally, you can continue to organize files under directories to decrease duplication and use flat route syntax in the folder name

```fs
routes/
  projects.$projectId/
  +layout.marko
  members+page.marko
  +layout.marko
```

Finally, flat routes and routes defined with directories are all treated equally and merged together. For example this page will have layout

```fs
routes/
  projects/
    $projectId/
      +layout.marko
  projects.$projectId+page.marko
```

## Multiple Paths, Groups and Optional Segments

Along with describing multiple segments, flat route syntax supports defining routes that match more than one path and segments that are optional. To describe a route that matches multiple paths, use a comma (`,`) and define each route.

For example the following page matches `/projects/$projectId/members` and `/projects/$projectId/people`

```fs
routes/
  projects.$projectId.members,projects.$projectId.people+page.marko
```

This file name is a bit long so you might do something like this

```fs
routes/
  projects.$projectId
  members,people+page.marko
```

We can simplify this by introducing another concept: **grouping**. Groups allows you to define segments within a flat route that match multiple sub-paths by surrounding them with parentheses (`(` and `)`). For the example, this means you can do the following:

```fs
routes/
  projects.$projectId.(members,people)+page.marko
```

This is a simple example of grouping but you can nest groups and make them as complicated as you want.

The last concept is **optionality**. By introducing an empty segment or pathless segment along with another value you can make that segment optional. For example, If we want a page that matches `/projects` and `/projects/home`, you can create a flat route that optionally matches `home`

```fs
routes/
  projects.(home,)+page.marko
```

or

```fs
routes/
  projects.(home,_pathless)+page.marko
```

While both of these create a route which matches the paths, they have slightly different semantics. Using a pathless segment is the same as creating a pathless directory which allows you to isolate middleware and layouts. Using an empty segment is the same as defining a file at the current location.
