# Why is Marko Fast?

> [!TLDR]
> - Zero-JS by default with fine-grained bundling
> - Targeted compilation for server and client
> - First-class HTML streaming capabilities
> - Compile-time reactivity

Marko is heavily optimized for small bundles, fast server renders, and efficient client updates. Independent benchmarks show Marko Run generating [far smaller bundles than similar frameworks](https://www.lorenstew.art/blog/10-kanban-boards), and Marko has [topped the charts](https://github.com/BuilderIO/framework-benchmarks?tab=readme-ov-file#ssr-times) on [JS framework SSR comparisons](https://github.com/eknkc/ssr-benchmark?tab=readme-ov-file#renderers) for [nearly a decade](https://github.com/raxjs/server-side-rendering-comparison?tab=readme-ov-file). These wins are fueled by Marko's _obsession_ with bundle size and performance, both in micro-optimizations and larger architectural decisions.

This article focuses on the details of optimizations applied to Marko, rather than comparing benchmark numbers. Our mission is to move as much complexity as we can out of your code and into the compiler, and we've come a long way since the first version of this page [in 2017](https://medium.com/hackernoon/why-is-marko-fast-a20796cb8ae3)!

## Zero JS by Default

A key difference between Marko 6 and other frameworks is what it doesn't need to include in the client bundle. Static content compiles to zero client-side JavaScript, _even when it is in the same component as interactive content_.

```marko
/* listing.marko */
export interface Input {
  product: Marko.AttrTag<{ name: string; content: Marko.Body; price: number }>
}

<h1>${input.product.name}</h1>
<p>${input.product.description}</p>
<div>Price: $${input.product.price}</div>

<let/quantity=1>
<button onClick() { quantity-- }>-</button>
<span>${quantity}</span>
<button onClick() { quantity++ }>+</button>
```

When this `<listing>` component is rendered in a server context, the _only_ JavaScript sent to the browser is an event listener for each button and the logic for updating text in the `<span>`. Since Marko analyzes the entire codebase at compile time, it is able to determine that everything else is static and requires no client-side code.

Some frameworks, including older versions of Marko, use the [islands architecture](https://www.patterns.dev/vanilla/islands-architecture/) to achieve similar results. Islands operate at component boundaries, but Marko analyzes at the _expression level_. Within a single component, static expressions generate no JavaScript while interactive expressions generate targeted update code. This granularity helps to significantly reduce the amount of static content that ends up in the client bundle.

See [Fine-Grained Bundling](./fine-grained-bundling.md) for more details.

## Targeted Compilation

Marko compiles templates twice: once for the server, and once for the browser. Each compilation produces code optimized for its specific environment. To get a feel for this, visit [our playground](/playground) and select "Client JS" or "Server JS" in the preview menu.

### Server Compilation

Compared to frameworks that use virtual DOM, Marko has a significant advantage for server-side rendering. Virtual DOM approaches require a two-step process to render HTML:

1. First pass to produce an entire virtual DOM tree in memory
2. Second pass to serialize the virtual DOM tree to an HTML string that can be sent over the wire

In contrast, Marko renders directly to an HTML stream in a single pass. There is no intermediate tree data structure. The server compilation of a Marko application is essentially a series of string concatenations that build up an HTML document, and server render requires no DOM representation.

> [!TIP]
> This single-pass approach naturally enables [HTML streaming](#html-streaming), allowing content to be sent to the browser progressively as it's rendered.

### Client Compilation

The code that Marko _does_ end up sending to the client after its [fine-grained bundling](#zero-js-by-default) includes only [stateful values](./serializable-state.md), [event handlers and `<script>` effects](../reference/core-tag.md#script), and a [tree-shaken runtime](#tree-shakeable-runtime) for core features.

Because of [compile-time reactivity](#compile-time-reactivity), Marko does _not_ need to include a JS-based representation of the DOM in the client compilation.

Read more about this in [Targeted Compilation](./targeted-compilation.md).

## HTML Streaming

Marko has first-class support for HTML streaming, allowing content to be sent to the browser as soon as it's ready rather than waiting for the entire page to finish rendering:

```marko
export interface Input {
  title: string;
  content: Marko.Body;
  id: string;
}

// Fast content renders immediately
<h1>${input.title}</h1>
<section><${input.content}/></section>

// Slow content streams when ready
<await|recommendations|=fetchRecommendations(input.id)>
  <ul>
    <for|item| of=recommendations>
      <li>${item.title}</li>
    </for>
  </ul>
</await>
```

Marko flushes the heading and main section immediately. When `fetchRecommendations()` resolves, the recommendations section streams to the client.

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

Before generating runtime code, the compiler determines that `count` is mutable state, `doubled` depends on `count`, and the text nodes in the button depend on `count` and `doubled`. When `count` changes, the runtime executes a pre-computed sequence: recalculate `doubled`, and update two text nodes inside the button. No dependency tracking happens at runtime.

## Further Reading

- [Why Marko?](../introduction/why-marko.md)
- [Targeted Compilation](./targeted-compilation.md)
- [Fine-Grained Bundling](./fine-grained-bundling.md)
- [HTML Streaming](./streaming.md)
