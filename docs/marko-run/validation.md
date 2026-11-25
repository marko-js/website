# Validation

The global `Run` verb helpers declare HTTP handlers and attach validation options that parse, transform, and type path parameters, query strings, and request bodies.

## Verb Helpers

Each verb helper (`Run.GET`, `Run.HEAD`, `Run.POST`, `Run.PUT`, `Run.DELETE`, `Run.PATCH`, `Run.OPTIONS`, `Run.QUERY`, and `Run.ALL`) accepts a handler function or array of functions, with optional validation options first:

```ts
Run.POST(handler); // single handler
Run.POST([auth, handler]); // composed handlers
Run.POST(options, handler); // validation options + handler
Run.POST(options, [auth, handler]); // validation options + composed handlers
Run.POST(options); // options only, validates and passes through
```

Export verb helpers by method name in [`+handler` files](./file-based-routing.md#handler) or as the `default` export in [`+middleware` files](./file-based-routing.md#middleware).

> [!NOTE]
> `Run` is global in route files with no imports needed. See [TypeScript](./typescript.md#run-namespace).

## Params and Search

The `params` and `search` options validate and transform [path parameters](./file-based-routing.md#path-structure) and query string values. Without a validator, `ctx.params` is a string map and `ctx.search` is a parsed query object (repeated keys become string arrays).

A validator is either a function or a [Standard Schema](https://github.com/standard-schema/standard-schema) (Valibot, Zod, ArkType, etc.):

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
      const id = Number(value.id);
      if (Number.isNaN(id)) throw new Response("Invalid ID", { status: 400 });
      return { id };
    },
  },
  (ctx) => {
    ctx.params.id; // number
    ctx.search.page; // number
  },
);
```

Function validators replace the value with their return value (and reject invalid input by throwing a `Response`). Standard Schema validators produce a [`[value, issues]` tuple](#standard-schema).

Validation is lazy: `ctx.params` and `ctx.search` run on first property access and cache the result for subsequent reads.

> [!WARNING]
> Standard Schema validators must be synchronous; async schemas throw at runtime.

## Request Bodies

`POST`, `PUT`, `PATCH`, and `QUERY` handlers declare body parsing and validation with `json` or `form`. When either option configures a **validator**, `ctx.body` is a lazy promise for the parsed and validated body; without a validator, `ctx.body` is `undefined` (even if size limits are passed; use an identity validator such as `json: (value) => value` to accept raw parsed data).

```ts
import * as v from "valibot";

const NoteSchema = v.object({ text: v.pipe(v.string(), v.nonEmpty()) });

export const POST = Run.POST({ json: NoteSchema }, async (ctx) => {
  const [note, issues] = await ctx.body;
  if (issues) {
    return Response.json({ issues }, { status: 422 });
  }
  return Response.json(createNote(note), { status: 201 });
});
```

The body is read and parsed only when `ctx.body` is awaited (or `.then` is called), so early rejections avoid reading the request stream. Malformed bodies fail with `400`, bodies exceeding configured limits fail with `413`, and mismatched `Content-Type` headers fail with `415`.

> [!NOTE]
> `ctx.body` is a promise, not a function. Read it with `await ctx.body`; there is nothing to call.

<!---->

> [!WARNING]
> Calling `ctx.request.json()` or `ctx.request.formData()` directly bypasses validation and size limits. Configure `json` or `form` on the verb helper and read `await ctx.body` instead.

### `json`

Handles `application/json` requests. Accepts a validator directly or an options object:

| Option      | Default        | Description                                     |
| :---------- | :------------- | :---------------------------------------------- |
| `validator` |                | Function or Standard Schema for the parsed JSON |
| `maxBytes`  | 1048576 (1MiB) | Maximum request body size in bytes              |

### `form`

Handles `application/x-www-form-urlencoded` and `multipart/form-data` requests. Repeated field names (for both text fields and uploaded files) collapse into arrays. Uploaded multipart files arrive in the parsed record as `File` instances carrying an extra `fieldName` property, or as the return value of `onFile` when provided.

| Option         | Default                   | Description                                                      |
| :------------- | :------------------------ | :--------------------------------------------------------------- |
| `validator`    |                           | Function or Standard Schema for the parsed form                  |
| `maxBytes`     | `maxFiles * maxFileBytes` | Maximum request body size in bytes                               |
| `maxParts`     | 1000                      | Maximum number of parts in a multipart request                   |
| `maxFiles`     | 20                        | Maximum number of files in a multipart request                   |
| `maxFileBytes` | 1048576 (1MiB)            | Maximum size of each uploaded file in bytes                      |
| `onFile`       |                           | `(ctx, file) => any` called per file; return value replaces file |

Multipart upload example:

```marko
/* +page.marko */
<form method="post" enctype="multipart/form-data">
  <input name="title" required>
  <input name="avatar" type="file" accept="image/*" required>
  <button type="submit">Upload</button>
</form>
```

```ts
/* +handler.ts */
import * as v from "valibot";

const UploadSchema = v.object({
  title: v.pipe(v.string(), v.nonEmpty()),
  avatar: v.instance(File),
});

export const POST = Run.POST(
  {
    form: {
      validator: UploadSchema,
      maxFiles: 1,
      maxFileBytes: 5 * 1024 * 1024,
    },
  },
  async (ctx) => {
    const [upload, issues] = await ctx.body;
    if (issues) {
      return Response.json({ issues }, { status: 422 });
    }
    const bytes = await upload.avatar.arrayBuffer();
    await storeAvatar(upload.title, upload.avatar.name, bytes);
    return ctx.redirect("/profile", 303);
  },
);
```

## Standard Schema

Standard Schema validators resolve to a `[value, issues]` discriminated tuple: on success, `issues` is `undefined` and `value` has the parsed type; on failure, `value` holds the raw input and `issues` lists validation errors. Checking `issues` narrows `value` for that read:

```ts
export const POST = Run.POST({ form: signupSchema }, async (ctx, next) => {
  const [signup, issues] = await ctx.body;
  if (issues) {
    return next({ issues });
  }
  return next({ signup }); // downstream receives the narrowed type
});
```

> [!TIP]
> Check `issues` once in the handler and pass narrowed values to the page via [`next`](./data-loading.md) so templates receive validated data directly.

## Merging Options

Options declared across middleware and handlers for the same route merge shallowly: the last validator wins, while object options combine (for example, `maxBytes` in middleware merges with `validator` in a handler). Options-only middleware (`Run.ALL({ search: ... })`) applies shared validation to every nested route.

## Next Steps

- [Data Loading](./data-loading.md)
- [Runtime](./runtime.md#context)
- [TypeScript](./typescript.md#generated-types)
