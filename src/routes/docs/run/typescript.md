# TypeScript

## Global Namespace

`marko/run` provides a global namespace `MarkoRun` with the following types:

**`MarkoRun.Handler`** - Type that represents a handler function to be exported by a +handler or +middleware file

**`MarkoRun.Route`** - Type of the route's params and metadata

**`MarkoRun.Context`** - Type of the request context object in a handler and `$global` in your Marko files. This type can be extended using TypeScript's module and interface merging by declaring a `Context` interface on the `@marko/run` module within your applcation code

```ts
declare module "@marko/run" {
  interface Context {
    customPropery: MyCustomThing; // will be globally defined on MarkoRun.Context
  }
}
```

**`MarkoRun.Platform`** - Type of the platform object provided by the adapter in use. This interface can be extended in that same way as `Context` (see above) by declaring a `Platform` interface:

```ts
declare module "@marko/run" {
  interface Platform {
    customPropery: MyCustomThing; // will be globally defined on MarkoRun.Platform
  }
}
```

## Generated Types

If a [TSConfig](https://www.typescriptlang.org/tsconfig) file is discovered in the project root, the Vite plugin will automatically generate a .d.ts file which provides more specific types for each of your middleware, handlers, layouts, and pages. This file will be generated at `.marko-run/routes.d.ts` whenever the project is built - including dev.

> **Note** TypeScript will not include this file by default. You should use the [Marko VSCode plugin](https://marketplace.visualstudio.com/items?itemName=Marko-JS.marko-vscode) and [add it in your tsconfig](https://www.typescriptlang.org/tsconfig#include).

These types are replaced with more specific versions per routable file:

**`MarkoRun.Handler`**

- Overrides context with specific MarkoRun.Context

**`MarkoRun.Route`**

- Adds specific parameters and meta types
- In middleware and layouts which are used in many routes, this type will be a union of all possible routes that the file will see

**`MarkoRun.Context`**

- In middleware and layouts which are used in many routes, this type will be a union of all possible routes that the file will see.
- When an adapter is used, it can provide types for the platform
