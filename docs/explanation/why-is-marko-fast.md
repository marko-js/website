# Why is Marko Fast?

> [!TLDR]
> - Zero-JS by default with fine-grained bundling
> - Targeted compilation for server and client
> - First-class HTML streaming capabilities
> - Compile-time reactivity

At eBay, Marko serves over a billion page views daily. Independent benchmarks show [Marko generating 6x smaller bundles than Next.js](https://www.lorenstew.art/blog/10-kanban-boards), and Marko consistently tops the charts on framework SSR comparisons. These wins are because of Marko's _obsession_ with bundle size and performance, both in micro-optimizations and larger architectural decisions.

This article focuses on the details of optimizations applied to Marko, rather than comparing benchmark numbers. Our mission is to move as much complexity as we can out of your code and into the compiler, and we've come a long way since we first wrote this article [in 2017](https://medium.com/hackernoon/why-is-marko-fast-a20796cb8ae3)!

## Zero JS by Default

The biggest difference between Marko 6 and other frameworks is what it doesn't send to the client. Static content compiles to zero client-side JavaScript, _even when it is in the same component as interactive content_.

Consider this template:

```marko
/* listing.marko */
<h1>${input.product.name}</h1>
<p>${input.product.description}</p>
<div>Price: $${input.product.price}</div>

<let/quantity=1>
<button onClick() { quantity-- }>-</button>
<span>${quantity}</span>
<button onClick() { quantity++ }>+</button>
```

When this `<listing>` component is rendered in a server context, the _only_ JavaScript sent to the browser is an event listener for each button and the logic for updating text in the `<span>`. Since Marko analyzes the entire codebase at compile time, it is able to determine that everything else is static and requires no client-side code.

Some frameworks, including older versions of Marko, use the [islands architecture](https://www.patterns.dev/vanilla/islands-architecture/) to achieve similar results. Islands operate at component boundaries, but Marko analyzes at the expression level. Within a single component, static expressions generate no JavaScript while interactive expressions generate targeted update code. This granularity means architectural decisions can focus on maintainability rather than bundle optimization.

See [Fine-Grained Bundling](./fine-grained-bundling.md) for more details.

## Targeted Compilation

Marko compiles templates twice: once for the server and once for the browser. Each compilation produces code optimized for its specific environment. To get a feel for this, visit [our playground](/playground) and select "Client JS" or "Server JS" in the preview menu.

### Server Compilation

Compared to frameworks that use virtual DOM, Marko has a significant advantage for server-side rendering. Virtual DOM approaches require a two-step process to render HTML:

1. First pass to produce an entire virtual DOM tree in memory
2. Second pass to serialize the virtual DOM tree to an HTML string that can be sent over the wire

In contrast, Marko renders directly to an HTML stream in a single pass. There is no intermediate tree data structure. The server compilation of a Marko application is essentially a series of string concatenations that build up an HTML document. A server render requires no DOM representation.

> [!TIP]
> This single-pass rendering eliminates the memory overhead of building an intermediate tree structure, making Marko particularly efficient for server-side rendering at scale.

### Client Compilation

The code that Marko _does_ end up sending to the client after its [fine-grained bundling](#zero-js-by-default) includes only [stateful values](./serializable-state.md), [event handlers and `<script>` effects](../reference/core-tag.md#script), and a tree-shaken runtime for core features.

Read more about this in [Targeted Compilation](./targeted-compilation.md).

## HTML Streaming

Marko supports HTML streaming, allowing content to be sent to the browser as soon as it's ready rather than waiting for the entire page to finish rendering:

```marko
<h1>${input.title}</h1>

// Fast content renders immediately
<section>${input.overview}</section>

// Slow content streams when ready
<await|recommendations|=fetchRecommendations()>
  <ul>
    <for|item| of=recommendations>
      <li>${item.title}</li>
    </for>
  </ul>
</await>
```

Marko flushes the heading and overview immediately. When `fetchRecommendations()` resolves, the recommendations section streams to the client. The browser starts parsing and rendering content, downloading CSS and other resources before the full HTML arrives.

> [!NOTE]
> The browser begins rendering immediately as content arrives, rather than waiting for the complete HTML document. This improves perceived performance, especially for pages with slow data dependencies.

Marko has supported streaming [since 2014](https://innovation.ebayinc.com/stories/async-fragments-rediscovering-progressive-html-rendering-with-marko/), predating React Server Components by nearly a decade. See [HTML Streaming](./streaming.md) for more details.

## Tree-Shakeable Runtime

The Marko runtime is not distributed as a single JavaScript file. The compiler generates code that imports only the specific runtime helpers needed by each template.

Consider this template with a dynamic style attribute:

```marko
<let/color="red">
<div style={ "background-color": color }>
  Content
</div>
```

The compiled code imports a style helper to handle the object-to-CSS conversion:

```js
/* compiled-template.marko */
import { styleAttr } from "marko/runtime/dom/helpers";

// ... template code that uses styleAttr
```

Templates only import the helpers they use, and bundlers tree-shake the rest. This means if a Marko feature isn't used in an app, no code for it is included in the bundle.

## Compile-Time Reactivity

Reactivity analysis happens entirely at compile time:

```marko
<let/count=0>
<const/doubled=count * 2>

<button onClick() { count++ }>${count} × 2 = ${doubled}</button>
```

Before generating runtime code, the compiler determines that `count` is mutable state, `doubled` depends on `count`, and the text nodes in the button depend on `count` and `doubled`. When `count` changes, the runtime executes a pre-computed sequence: recalculate `doubled`, and update two text nodes inside the button. No dependency tracking runs at runtime.

## Further Reading

- [Why Marko?](../introduction/why-marko.md)
- [Targeted Compilation](./targeted-compilation.md)
- [Fine-Grained Bundling](./fine-grained-bundling.md)
- [HTML Streaming](./streaming.md)
