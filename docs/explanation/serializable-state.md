# Serializable State

> [!TLDR]
> - Serialize plain data only
> - Supported: primitives, arrays, plain objects, Dates, Map/Set, TypedArrays, URL/SearchParams, BigInt
>   - References and cycles are preserved
> - Avoid: user-defined functions, non-built-in class instances, DOM, closures

State passed from server to client must be serialized into HTML. Keeping state plain and deterministic ensures reliable hydration and enables compiler optimizations.

## Serializable Data

State is embedded into HTML during server rendering. The serializer supports the following plain data types:

- Primitives: `null`, `boolean`, `number`, `string`, `bigint`
- Arrays and plain objects with serializable values
- Dates
- Map, Set
- Typed arrays and ArrayBuffer/DataView
- URL and URLSearchParams
- Additional built-in JS and Browser objects
  - For a complete list, see the [serializer file](https://github.com/marko-js/marko/blob/main/packages/runtime-tags/src/html/serializer.ts) from source

Nested values must also be serializable.

```marko
<let/state={
  id: 42,
  name: "Ada",
  tags: ["admin", "editor"],
  createdAt: new Date("2024-01-01T12:00:00.000Z"),
  prefs: new Map([["theme", "dark"]]),
  ids: new Set([1, 2, 3]),
  bytes: new Uint8Array([1, 2, 3]),
  query: new URLSearchParams({ q: "marko" }),
}>
```

## Unserializable Data

Some values cannot be embedded into HTML in a stable, deterministic way. These should not generally be stored in state:

- Functions and closures
- Class instances (except built-ins explicitly supported by the runtime)
- DOM nodes and elements

Instead, keep plain data in state and construct functions, class instances, or DOM references at usage sites (for example, in event handlers or server actions).

```marko
// ❌ BAD: function in state
<let/state={ save: () => doThing() }>

// ❌ BAD: custom class instance in state
<let/state=new Cart()>

// ❌ BAD: DOM nodes in state
<let/state={ el: document.body }>
```

## Further Reading

- [Immutable State](./immutable-state.md)
- [Reactivity](../reference/reactivity.md)
- [Fine-Grained Bundling](./fine-grained-bundling.md)
- [Streaming](./streaming.md)
