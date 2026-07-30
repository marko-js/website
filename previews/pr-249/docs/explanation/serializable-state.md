# Serializable State

Marko seamlessly picks up where the server left off when it comes to events, scripts and client side updates through state.
In order to do this Marko will attempt to serialize as little data as possible from the server to the client.

Most standard data types can be serialized, including:

- Primitives: `null`, `boolean`, `number`, `string`, `bigint`
- Arrays and plain objects with serializable values
- Dates and regular expressions
- Map, Set
- Typed arrays and ArrayBuffer/DataView
- URL and URLSearchParams
- Headers, FormData, Request, Response
- Built-in error types, including AggregateError
- Intl formatters and Temporal values
- Well-known and registered symbols
- Promises, generators, async generators, and ReadableStream
- Additional built-in JS and Browser objects
  - For a complete list, see the [serializer file](https://github.com/marko-js/marko/blob/main/packages/runtime-tags/src/html/serializer.ts) from source

State reaches the client automatically when something there depends on it. [`$global`](../reference/language.md#global) does not: it is server data until a property is named in [`$global.serializedGlobals`](../reference/template.md#globalserializedglobals), which is what makes request-scoped values such as a locale readable after hydration.

## Shared References

The payload is JavaScript, not JSON, so a value reached twice is written once and referenced everywhere else. Identity carries over with it: objects that are the same on the server are the same object in the browser, and cyclic structures are restored as cycles.

Consider a comment list where several comments share one author record:

```marko
<let/muted=null>
<ul>
  <for|comment| of=input.comments>
    <li class=(comment.author === muted && "muted")>
      ${comment.text}
      <button onClick() { muted = comment.author }>mute</button>
    </li>
  </for>
</ul>
```

Every comment by one author points at a single serialized record, so muting one of them dims the rest without comparing ids. The same holds across [streaming](./streaming.md) flushes, where a later chunk refers back to a value an earlier chunk already sent.

## Streaming Values

Marko serializes a ReadableStream or an async generator while it is still producing. Each value is written into a later chunk of the same response as it is produced, so client code sees values arrive rather than waiting for the whole sequence.

Consider a build log delivered as an async generator:

```marko
<let/progress=null>
<script>
  for await (const update of input.buildLog) {
    progress = update;
  }
</script>
<p>${progress?.step ?? "queued"}</p>
```

## Pending Promises

An unsettled promise is serializable. It reaches the browser pending and settles when the server settles it, delivering either the resolved value or the rejection reason.

```marko
<let/quote="pending">
<script>
  try {
    quote = (await input.quote).total;
  } catch {
    quote = "unavailable";
  }
</script>
<p>${quote}</p>
```

Passing a promise rather than awaiting it first keeps the response moving, since the HTML flushes while the work is in flight and the result follows on a later chunk. [Marko Run](../marko-run/data-loading.md) handlers pass promises through `next` for the same reason.

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
