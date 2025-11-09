# Serializable State

Marko seamlessly picks up where the server left off when it comes to events, scripts and client side updates through state.
In order to do this Marko will attempt to serialize as little data as possible from the server to the client.

Most standard data types can be serialized, including:

- Primitives: `null`, `boolean`, `number`, `string`, `bigint`
- Arrays and plain objects with serializable values
- Dates
- Map, Set
- Typed arrays and ArrayBuffer/DataView
- URL and URLSearchParams
- Additional built-in JS and Browser objects
  - For a complete list, see the [serializer file](https://github.com/marko-js/marko/blob/main/packages/runtime-tags/src/html/serializer.ts) from source

... and many more.

## Unserializable Data

Some values cannot be serialized. When these values are encountered the Marko runtime will provide a helpful message to locate the relevant code.

Examples of unserializable data include:
- Closures (top level functions are fine!)
- Functions that come from arbitrary javascript code or imports
- Class instances (except built-ins explicitly supported by the runtime)
- DOM nodes and elements

> [!NOTE]
> Most functions and closures _are_ serializable.
> 
> ```marko
> <let/handler=null>
> <const/onSecondClick() { 
>   // serializable!
> }>
> 
> <button onClick() { handler?.(); handler = onSecondClick }/>
> ```

```marko
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
