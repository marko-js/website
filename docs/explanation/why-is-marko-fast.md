# Why is Marko Fast?

> [!TLDR]
>
> - Zero-JS by default with fine-grained bundling
> - Targeted compilation for server and browser
> - First-class HTML streaming
> - Compile-time reactivity and resumability

Marko achieves [tiny client bundles](https://www.lorenstew.art/blog/10-kanban-boards), [high-throughput SSR](https://github.com/BuilderIO/framework-benchmarks?tab=readme-ov-file#ssr-times) ([1](https://github.com/eknkc/ssr-benchmark?tab=readme-ov-file#renderers), [2](https://github.com/raxjs/server-side-rendering-comparison?tab=readme-ov-file)), and [fast DOM updates](https://github.com/krausest/js-framework-benchmark) by moving work out of runtime JavaScript and into the compiler. Five architectural decisions drive this performance.

## Targeted Compilation

The compiler generates two separate outputs per template: one for the server and one for the browser (inspect both live in the [Playground](/playground) under "Server JS" and "Client JS").

### Server Compilation

Virtual DOM renderers build an in-memory tree first and serialize it to HTML in a second pass. Marko compiles templates into single-pass string concatenation writing straight to an HTML stream, eliminating intermediate tree allocations and enabling [HTML streaming](#html-streaming) natively.

### Client Compilation

After [fine-grained bundling](#js-scales-from-zero), browser output includes only [serialized state](./serializable-state.md), event handlers, [`<script>`](../reference/core-tag.md#script) effects, and a [tree-shaken subset of runtime helpers](#tree-shakeable-runtime). [Compile-time reactivity](#compile-time-reactivity) removes the need for a JavaScript DOM mirror.

### Runtime Coordination

Server HTML embeds compact markers and [serialized state](./serializable-state.md). Browser code reads those markers to [resume](#resumability) directly from the existing DOM without re-executing server work. See [Targeted Compilation](./targeted-compilation.md).

## HTML Streaming

Marko flushes HTML to the browser as chunks finish rendering rather than buffering the whole page:

```marko
export interface Input {
  title: string;
  content: Marko.Body;
  id: string;
}

// Flushes immediately
<h1>${input.title}</h1>
<section><${input.content}/></section>

// Streams when ready
<await|recommendations|=fetchRecommendations(input.id)>
  <ul>
    <for|item| of=recommendations>
      <li>${item.title}</li>
    </for>
  </ul>
</await>
```

Marko has supported HTML streaming [since 2014](https://innovation.ebayinc.com/stories/async-fragments-rediscovering-progressive-html-rendering-with-marko/). See [HTML Streaming](./streaming.md).

## JS Scales from Zero

Static markup compiles to zero browser JavaScript even inside the same template as interactive controls, and server work is never re-run in the browser.

### Fine-Grained Bundling

The compiler analyzes templates at the **expression** level rather than component-level [islands](https://www.patterns.dev/vanilla/islands-architecture/):

```marko
export interface Input {
  product: {
    name: string;
    description: string;
    price: number;
  };
}

<h1>${input.product.name}</h1>
<p>${input.product.description}</p>
<div>Price: $${input.product.price}</div>

<let/quantity=1>
<button onClick() { quantity-- }>-</button>
<span>${quantity}</span>
<button onClick() { quantity++ }>+</button>
```

When server-rendered, the browser receives only the two click handlers and the `<span>` text update; none of the product heading, description, or price rendering logic ships to the client. See [Fine-Grained Bundling](./fine-grained-bundling.md).

### Resumability

Traditional SSR relies on [hydration](https://en.wikipedia.org/wiki/Hydration_%28web_development%29), re-executing component code in the browser to recreate state and wire listeners. Marko skips hydration: client code deserializes only needed state, attaches delegated listeners, and locates target DOM nodes directly via server markers.

## Tree-Shakeable Runtime

Compiled templates import only the specific runtime helpers they use:

```marko
/* template.marko */
<let/color="red">
<div style={ "background-color": color }>Content</div>
```

```js
/* compiled-template.js */
import { _attr_style_item } from "marko/dom";

// ...rest of compiled output
```

Bundlers tree-shake unused helpers away so unused language features add zero bytes.

## Compile-Time Reactivity

Dependency graphs resolve at compile time:

```marko
<let/count=0>
<const/doubled=count * 2>

<button onClick() { count++ }>${count} × 2 = ${doubled}</button>
```

The compiler emits a pre-computed update sequence for `count` that recalculates `doubled` and updates both text nodes directly, with no runtime dependency tracking.

## Performance by Default

Marko's language design makes fast patterns the natural path ([the pit of success](https://blog.codinghorror.com/falling-into-the-pit-of-success/)): async rendering streams automatically, static expressions stay on the server without annotations, and reactive updates are compiled ahead of time. Refined in production since 2014, these architectural choices keep both SSR latency and browser bundles lean as applications grow.

## Further Reading

- [Why Marko?](../introduction/why-marko.md)
- [Targeted Compilation](./targeted-compilation.md)
- [Fine-Grained Bundling](./fine-grained-bundling.md)
- [HTML Streaming](./streaming.md)
