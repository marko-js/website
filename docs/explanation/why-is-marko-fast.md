# Why is Marko Fast?

> [!TLDR]
> - Zero-JS by default with fine-grained bundling
> - Targeted compilation for server and client
> - First-class HTML streaming capabilities
> - Compile-time reactivity

Marko is heavily optimized for small bundles, fast server renders, and [efficient client updates](https://github.com/krausest/js-framework-benchmark). Independent benchmarks show Marko generating [far smaller bundles than similar frameworks](https://www.lorenstew.art/blog/10-kanban-boards), and Marko has [topped the charts](https://github.com/BuilderIO/framework-benchmarks?tab=readme-ov-file#ssr-times) on [JS framework SSR comparisons](https://github.com/eknkc/ssr-benchmark?tab=readme-ov-file#renderers) for [nearly a decade](https://github.com/raxjs/server-side-rendering-comparison?tab=readme-ov-file). These wins are fueled by Marko's _obsession_ with bundle size and performance, both in micro-optimizations and larger architectural decisions.

This article focuses on the details of optimizations applied to Marko, rather than comparing benchmark numbers. Our mission is to move as much complexity as we can out of your code and into the compiler, and we've come a long way since the first version of this page [in 2017](https://medium.com/hackernoon/why-is-marko-fast-a20796cb8ae3)!

## Targeted Compilation

The Marko compiler produces two outputs: one for the server, and one for the browser. Each compilation produces code optimized for its specific environment. To get a feel for this, visit [our playground](/playground) and select "Client JS" or "Server JS" in the preview menu.

### Server Compilation

Compared to frameworks that use virtual DOM, Marko has a significant advantage for server-side rendering. Virtual DOM approaches require a two-step process to render HTML:

1. First pass to produce an entire virtual DOM tree in memory
2. Second pass to serialize the virtual DOM tree to an HTML string that can be sent over the wire

In contrast, Marko renders directly to an HTML stream in a single pass. There is no intermediate tree data structure. The server compilation of a Marko application is essentially a series of string concatenations that build up an HTML document, and server render requires no DOM representation.

> [!NOTE]
> This single-pass approach naturally enables [HTML streaming](#html-streaming), allowing content to be sent to the browser progressively as it's rendered.

### Client Compilation

The code that Marko _does_ end up sending to the client after its [fine-grained bundling](#js-scales-from-zero) includes only [stateful values](./serializable-state.md), [event handlers and `<script>` effects](../reference/core-tag.md#script), and a [tree-shaken runtime](#tree-shakeable-runtime) for core features.

Because of [compile-time reactivity](#compile-time-reactivity), Marko does _not_ need to include a JS-based representation of the DOM in the client compilation.

### Runtime Coordination

Each runtime is optimized for server-client handoff. When the server renders a template, it embeds comment markers and [serialized state](./serializable-state.md) directly in the HTML output. The client compilation includes information about where to look for these markers and how to deserialize the state, allowing it to [resume execution](#resumability) without re-executing work that was done on the server.

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

> [!TIP]
> The browser begins rendering immediately as content arrives, rather than waiting for the complete HTML document. This improves perceived performance, especially for pages with slow data dependencies.

Marko has supported streaming [since 2013](https://innovation.ebayinc.com/stories/async-fragments-rediscovering-progressive-html-rendering-with-marko/), predating other frontend frameworks by nearly a decade. See [HTML Streaming](./streaming.md) for more details.

## JS Scales from Zero

A key difference between Marko 6 and other frameworks is what it doesn't need to include in the client bundle. Static content compiles to zero client-side JavaScript _even when it is in the same template as interactive content_, and work that happens on the server is never re-executed by browser JS unless necessary.

### Fine-Grained Bundling

Marko's compiler looks at each template and determines which _parts_ of it will update after state changes on the client.

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

When this `<listing>` tag is rendered in a server context, the _only_ JavaScript sent to the browser is an event listener for each button and the logic for updating text in the `<span>`. Since Marko analyzes the entire codebase at compile time, it is able to determine that everything else is static and requires no client-side code.

Some frameworks, including older versions of Marko, use the [islands architecture](https://www.patterns.dev/vanilla/islands-architecture/) to achieve similar results. Islands operate at component boundaries, but Marko analyzes at the _expression level_. Within a single template, static expressions generate no JavaScript while interactive expressions generate targeted update code. This granularity helps to significantly reduce the amount of static content that ends up in the client bundle.

See [Fine-Grained Bundling](./fine-grained-bundling.md) for more details.

### Resumability

Most frameworks with SSR will _re-execute_ portions of the application on the client after HTML has been sent from the server in a process called [hydration](<https://en.wikipedia.org/wiki/Hydration_(web_development)>). Not only does this process require that work is doubled (once on the server and once on the client), but it also necessitates that client rendering logic is included for each interactive component.

Marko's client-side code doesn't re-render templates during initialization. Instead it hooks up event listeners, deserializes stateful data, and determines which DOM nodes it will need to update once state changes. Notably, state is _not_ re-created by client-side JavaScript.

## Tree-Shakeable Runtime

The Marko runtime is not distributed as a single JavaScript file. The compiler generates code that imports only the specific runtime helpers needed by each template.

```marko
/* template.marko */
<let/color="red">
<div style={ "background-color": color }>
  Content
</div>
```

The compiled code imports a helper for applying the style:

```js
/* compiled-template.js */
import { _attr_style_item } from "marko/dom";

// ...rest of compiled output
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

## What is a Fast Framework?

A fast framework needs more than performance optimizations. The wins in this page mean little if developers write inefficient code or create request waterfalls. A truly fast framework provides a language design that guides developers toward efficient patterns by default.

Marko is a performance [pit of success](https://blog.codinghorror.com/falling-into-the-pit-of-success/). HTML streaming is built in and works naturally with async operations, static content remains static without manual optimization, and reactivity happens at compile time. The framework handles these concerns automatically when developers write straightforward component code.

Over 12 years of development, Marko has accumulated lessons about what matters for real-world performance and evolved accordingly. These architectural decisions, combined with hundreds of smaller optimizations, make Marko the fastest SSR framework with the smallest client bundles and an effective tool for building efficient websites.

## Further Reading

- [Why Marko?](../introduction/why-marko.md)
- [Targeted Compilation](./targeted-compilation.md)
- [Fine-Grained Bundling](./fine-grained-bundling.md)
- [HTML Streaming](./streaming.md)
