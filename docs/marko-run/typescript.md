# TypeScript

Marko Run is designed to be used with TypeScript. Route files get typed request contexts. Validated params and bodies flow through to pages, and URLs are checked against the routes the application serves.

## Run Namespace

Marko Run provides a global namespace `Run`, available in route files without any imports. At runtime it exposes the [verb helpers](./validation.md#verb-helpers) (`Run.GET`, `Run.POST`, ..., `Run.ALL`) and [`Run.href`](./runtime.md#typed-urls). In TypeScript it also provides:

**`Run.Context`** - Type of the request context object in a handler and `$global` in Marko files. This type can be extended using TypeScript's module and interface merging by declaring a `Context` interface on the `@marko/run` module within the application code:

```ts
declare module "@marko/run" {
  interface Context {
    customProperty: MyCustomThing; // will be globally defined on Run.Context
  }
}
```

The platform object provided by the [adapter](./adapters.md) in use can be typed the same way by declaring a `Platform` interface:

```ts
declare module "@marko/run" {
  interface Platform {
    customProperty: MyCustomThing; // will be available on `ctx.platform`
  }
}
```

> [!NOTE]
> Reserve the `Context` interface for application-wide properties that every route can rely on, like a database connection or session helper. For route-specific values, prefer [data loading](./data-loading.md) via `next`, which types the data per route automatically.

## Generated Types

If a [TSConfig](https://www.typescriptlang.org/tsconfig) file is discovered in the project root, Marko Run will automatically generate a `.d.ts` file which provides more specific types for each middleware, handler, layout, and page. This file is generated at `.marko-run/routes.d.ts` whenever the project is built, including during dev.

> [!NOTE]
> TypeScript will not include this file by default. Use the [Marko VSCode plugin](https://marketplace.visualstudio.com/items?itemName=Marko-JS.marko-vscode) and [add the file in the tsconfig `include`](https://www.typescriptlang.org/tsconfig#include).

With the generated types, the `Run` namespace is narrowed per routable file:

**`Run.Context`**

- Has the exact path params, meta, validated `search` and `body`, and upstream `data` types for the routes the file serves
- In middleware and layouts which are used in many routes, this type will be a union of all possible routes that the file will see
- When an adapter is used, it can provide types for the platform

**`Run` verb helpers**

Validation options and handler return types are fully inferred, so `ctx.params`, `ctx.search`, `ctx.body`, and the data passed to `next(...)` flow through to downstream handlers, pages, and layouts.

**`Run.href`**

The path and its params are typed against every route the application serves.

## Next Steps

- [Validation](./validation.md)
- [Runtime](./runtime.md#typed-urls)
- [TypeScript in Marko](../reference/typescript.md)
