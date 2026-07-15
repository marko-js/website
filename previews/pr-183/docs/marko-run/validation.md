# Validation

Handlers and middleware are written using the verb helpers defined on the global `Run` namespace. Beyond declaring which HTTP method a handler responds to, these helpers accept validation options that check, transform, and type a route's path parameters, query string, and request body.

## Verb Helpers

Each verb helper (`Run.GET`, `Run.HEAD`, `Run.POST`, `Run.PUT`, `Run.DELETE`, `Run.PATCH`, `Run.OPTIONS`, and `Run.ALL`) accepts a handler function or an array of handler functions, optionally preceded by validation options:

```ts
Run.POST(handler); // a handler function
Run.POST([auth, handler]); // an array of handlers, composed in order
Run.POST(options, handler); // validation options plus a handler
Run.POST(options, [auth, handler]); // validation options plus an array of handlers
Run.POST(options); // options only, validates and passes through
```

In a [`+handler` file](./file-based-routing.md#handler), export the result under the matching verb name. In a [`+middleware` file](./file-based-routing.md#middleware), use the default export. Handlers created for a specific verb only run for requests with that method. `Run.ALL`, available in middleware, runs for every method.

> [!NOTE]
> The `Run` namespace is a global, so no imports are needed in route files. See [TypeScript](./typescript.md#run-namespace) for the types it provides.

## Params and Search

The `params` and `search` options validate, and can transform, the route's [path parameters](./file-based-routing.md#path-structure) and query string. A validator is either a function or a [Standard Schema](https://github.com/standard-schema/standard-schema) (Zod, Valibot, ArkType, etc.).

Consider a middleware that normalizes a `page` query parameter for every route below it, and a handler that converts its `id` path parameter to a number:

```ts
/* +middleware.ts */
export default Run.ALL({
  search(value) {
    return { ...value, page: Number(value.page) || 0 };
  },
});
```

```ts
/* $id/+handler.ts */
export const GET = Run.GET(
  {
    params(value) {
      return { id: Number(value.id) };
    },
  },
  (ctx) => {
    ctx.params.id; // number
    ctx.search.page; // number
  },
);
```

Function validators replace the value with whatever they return. Standard Schema validators produce a [`[value, issues]` tuple](#schema-results).

Validators are lazy. `ctx.params` and `ctx.search` do not run their validators until the property is accessed. The first access runs the validator and caches the result for later reads. A request that never touches these properties never pays for their validation.

> [!WARNING]
> Standard Schema validation must be synchronous. Passing a schema whose validation resolves asynchronously throws at runtime.

## Request Bodies

`POST`, `PUT`, and `PATCH` handlers declare how request bodies are read with the `json` and `form` options. When either is configured, `ctx.body` is a promise for the parsed and validated body. Otherwise `ctx.body` is `undefined`.

```ts
import * as v from "valibot";

export const POST = Run.POST(
  {
    form: v.object({
      name: v.string(),
      age: v.pipe(v.string(), v.toNumber()),
    }),
  },
  async (ctx) => {
    const [data, issues] = await ctx.body;
    if (issues) {
      return Response.json({ issues }, { status: 400 });
    }
    return Response.json(data);
  },
);
```

Like `params` and `search`, `ctx.body` is lazy. The body is only read, parsed, and validated when the promise is consumed, meaning it is awaited or its `.then` method is called. A handler that rejects a request early does so without reading the body at all.

Function validators resolve `ctx.body` to their return value. Standard Schema validators resolve it to a [`[value, issues]` tuple](#schema-results). With no validator, it resolves to the raw parsed body.

> [!NOTE]
> Requests exceeding the configured size limits below are rejected.

### `json`

Handles requests with an `application/json` content type. The option can be a validator, or an options object:

| Option      | Default          | Description                                     |
| ----------- | ---------------- | ----------------------------------------------- |
| `validator` |                  | Function or Standard Schema for the parsed JSON |
| `maxBytes`  | `1048576` (1MiB) | Maximum request body size in bytes              |

### `form`

Handles requests with an `application/x-www-form-urlencoded` or `multipart/form-data` content type. Repeated field names become arrays. The option can be a validator, or an options object:

| Option         | Default                   | Description                                        |
| -------------- | ------------------------- | -------------------------------------------------- |
| `validator`    |                           | Function or Standard Schema for the parsed form    |
| `maxBytes`     | `maxFiles * maxFileBytes` | Maximum request body size in bytes                 |
| `maxParts`     | `1000`                    | Maximum number of parts in a multipart request     |
| `maxFiles`     | `20`                      | Maximum number of files in a multipart request     |
| `maxFileBytes` | `1048576` (1MiB)          | Maximum size of each uploaded file in bytes        |
| `onFile`       |                           | `(ctx, file) => any` called for each uploaded file |

## Schema Results

When a validator is a Standard Schema, the validated value is a `[value, issues]` tuple. On success, `issues` is `undefined` and `value` is the parsed output. On failure, `value` is the raw input and `issues` describes the problems.

In TypeScript this tuple is a discriminated union. The `issues` element must be checked before `value` narrows to the parsed type. Each read of the tuple narrows independently, so this check is required everywhere the result is used. That is simply how TypeScript narrowing works.

> [!TIP]
> Discriminate the tuple once in the handler and pass the narrowed data to the page with [`next`](./data-loading.md). The template then receives plain, already-validated values instead of repeating the `issues` check in both places.

```ts
export const POST = Run.POST({ form: signupSchema }, async (ctx, next) => {
  const [signup, issues] = await ctx.body;
  if (issues) {
    return next({ issues });
  }
  return next({ signup }); // downstream sees the narrowed type
});
```

## Merging Options

All options declared for a route, across its middleware and handler, are merged into a single set. When the same option is declared more than once, the last validator wins and object forms are merged shallowly. A `maxBytes` limit declared in one place combines with a `validator` declared in another.

This makes middleware a natural home for shared validation. An options-only `Run.ALL({ search: ... })` in a [`+middleware` file](./file-based-routing.md#middleware) applies to every route below it.

## Next Steps

- [Data Loading](./data-loading.md) shows how handlers pass validated data to pages and layouts
- [Runtime](./runtime.md#context) documents every property validators interact with on the context
- [TypeScript](./typescript.md#generated-types) explains how validated types flow through generated types
