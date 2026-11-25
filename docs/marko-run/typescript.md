# TypeScript

Marko Run integrates with TypeScript so route handlers, middleware, layouts, pages, and `Run.href` links receive end-to-end types inferred from the file system and validation schemas.

## Run Namespace

Marko Run exposes a global `Run` namespace in route files without imports: the [verb helpers](./validation.md#verb-helpers) (`Run.GET`, `Run.POST`, ..., `Run.ALL`), [`Run.href`](./runtime.md#typed-urls), and `Run.Context`.

### `Run.Context`

Types the request context in handlers and `$global` in Marko templates. Extend it for application-wide properties via module augmentation (include `export {}` if the file has no other imports or exports):

```ts
export {};

declare module "@marko/run" {
  interface Context {
    db: Database;
  }
}
```

Extend the adapter-provided `ctx.platform` object the same way through `Platform`:

```ts
declare module "@marko/run" {
  interface Platform {
    requestId: string;
  }
}
```

> [!NOTE]
> Reserve `Context` augmentation for application-wide properties present on every request (such as a database handle or session helper). For route-specific values, pass data via [`next(data)`](./data-loading.md), which types `$global.data` per route automatically.

### `GetContext`

For shared helper functions defined outside route files, import `GetContext` from `@marko/run` to obtain the context type for a route pattern:

```ts
import type { GetContext } from "@marko/run";

export function getProjectId(ctx: GetContext<"/projects/$projectId/*">) {
  return ctx.params.projectId;
}
```

## Generated Types

When a `tsconfig.json` exists in the project root, Marko Run generates `.marko-run/routes.d.ts` automatically during dev and build. Because TypeScript skips dot-directories in globs like `src/**/*`, list `.marko-run/*` explicitly in `include`:

```json
{
  "include": ["src/**/*", ".marko-run/*"],
  "compilerOptions": {
    "module": "ESNext",
    "moduleResolution": "bundler"
  }
}
```

`"moduleResolution": "bundler"` resolves `@marko/run`'s package `exports` types (already set in the [starter `tsconfig.json`](../introduction/installation.md#typescript-setup)). Check `.marko` files in the editor with [Marko for VS Code](https://marketplace.visualstudio.com/items?itemName=Marko-JS.marko-vscode) and in CI with `mtc` ([`@marko/type-check`](../reference/typescript.md#ci-type-checking)).

Generated types narrow the `Run` namespace per routable file and automatically type `Input` for `+layout.marko` (`{ content: Marko.Body }`) and `+500.marko` (`{ error: unknown }`):

### Narrowed `Run.Context`

- Carries exact `params`, `meta`, validated `search` and `body`, and upstream `data` types for the routes the file serves.
- In shared middleware and layouts, narrows to the union of all matched routes.
- Includes adapter-provided `platform` types when the active adapter supplies them.

### Inferred Verb Helpers

Validation schemas and `next(data)` return types flow automatically from middleware and handlers to downstream handlers, layouts, and pages.

### Checked `Run.href`

Route paths, dynamic params, and validated search keys are type-checked against every route in the application.

## Next Steps

- [Validation](./validation.md)
- [Runtime](./runtime.md#typed-urls)
- [TypeScript in Marko](../reference/typescript.md)
