# Serializable State

> [!TLDR]
>
> - Marko serializes only state that browser code reads so pages resume without re-rendering
> - Most JavaScript and Web API built-ins, promises, symbols, and cyclic references are supported
> - Template-authored functions and closures serialize; external module functions, custom classes, and DOM nodes do not

To resume server-rendered HTML in the browser, Marko serializes only the server values referenced by client event handlers, `<script>` effects, and reactive updates.

## Supported Types

Marko's serializer supports most standard JavaScript and Web API data types:

- Primitives: `undefined`, `null`, `boolean`, `number`, `string`, `bigint`
- Plain objects and arrays containing serializable values
- `Date`, `RegExp`, `Map`, `Set`
- Typed arrays, `ArrayBuffer`, and `DataView`
- `Promise`, generators, async generators, and `ReadableStream`
- `URL`, `URLSearchParams`, `Headers`, `Request`, `Response`, and `FormData` (string entries)
- Built-in `Error` types, including `AggregateError`
- `Intl` formatters and `Temporal` values
- Symbols (well-known, registered, and unregistered `Symbol()`)
- Functions and closures authored inside `.marko` templates (and supported JS built-in functions)

For the exact list, see [`serializer.ts`](https://github.com/marko-js/marko/blob/main/packages/runtime-tags/src/html/serializer.ts).

Reactive state reaches the client automatically when browser code depends on it. [`$global`](../reference/language.md#global) stays server-only unless properties are listed in [`$global.serializedGlobals`](../reference/template.md#globalserializedglobals) so request-scoped values such as a locale can be read after resume.

## Shared References

Because Marko serializes to JavaScript rather than JSON, a value reached multiple times is written once and referenced everywhere else. Object identity carries across server and browser, and cyclic graphs restore intact.

Consider a comment list where several comments share one author object:

```marko
export interface Input {
  comments: Array<{
    text: string;
    author: { name: string };
  }>;
}

<let/muted=null as Input["comments"][number]["author"] | null>

<ul>
  <for|comment| of=input.comments>
    <li class=(comment.author === muted && "muted")>
      ${comment.text}
      <button onClick() { muted = comment.author }>Mute</button>
    </li>
  </for>
</ul>
```

Every comment by the same author points to the same deserialized record, so `comment.author === muted` matches without comparing IDs. Reference sharing also persists across [streaming](./streaming.md) flushes when later chunks refer back to objects sent in earlier chunks.

## Unserializable Data

Values that cannot be serialized across the server-to-client boundary include:

- Functions imported from external `.js` or `.ts` modules, or created dynamically outside `.marko` templates
- Custom class instances (keep plain data in state and instantiate classes on the client inside [`<lifecycle>`](../reference/core-tag.md#lifecycle) or `<script>`)
- DOM nodes and elements (use native [element references](../reference/native-tag.md#element-references) instead)

Functions and closures defined directly inside `.marko` templates are compiler-registered and serializable:

```marko
<let/handler=null as (() => void) | null>
<const/onSecondClick() {
  // Registered by the compiler and serializable
}>

<button onClick() {
  handler?.();
  handler = onSecondClick;
}>
  Click
</button>
```

Keep reactive state as plain serializable data rather than custom class instances or DOM references:

```marko
// ✅ serializable plain data
<let/cart={ items: [{ id: 1, qty: 2 }] }>

// ❌ unserializable values (custom class instance or DOM node)
<let/invalidCart=new Cart()>
<let/invalidDom={ el: document.body }>
```

## Further Reading

- [Immutable State](./immutable-state.md)
- [Reactivity](../reference/reactivity.md)
- [Fine-Grained Bundling](./fine-grained-bundling.md)
- [Streaming](./streaming.md)
