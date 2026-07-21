# Optimizing Performance

> [!TLDR]
>
> - Pass promises early; await them where content renders
> - Keep state serializable and local to avoid extra resume data
> - Defer heavy client JS with lazy load triggers
> - Ship production builds (`NODE_ENV=production`)

Marko optimizes by default: static markup ships no client JavaScript, interactive expressions compile to targeted updates, and server output streams as soon as each section is ready. Application structure still matters for the remaining work, especially async data, serialized state, and large client widgets.

## Promise Passing

Start data loads as early as possible and pass the promise into the template. Unwrap it with [`<await>`](../reference/core-tag.md#await) where the result is needed. That lets [HTML streaming](./streaming.md) flush static shell content while the promise is still pending.

```marko
static function loadProduct(id) {
  return fetch(`/api/products/${id}`).then((r) => r.json());
}

export interface Input {
  productId: string;
}

<const/productPromise=loadProduct(input.productId)>

<article>
  <h1>Product</h1>
  <try>
    <await|product|=productPromise>
      <p>${product.name}</p>
    </await>
    <@placeholder>Loading product...</@placeholder>
  </try>
</article>
```

> [!WARNING]
> Fetching inside every leaf that needs the data serializes requests into waterfalls. Start independent promises once, near the top of the tree (or in a [Marko Run handler](../marko-run/data-loading.md)), and pass them down.

Under [Marko Run](../marko-run/data-loading.md), the same pattern is `return next({ product: loadProduct(id) })` without awaiting, then `<await|product|=$global.data.product>` in the page.

## Reducing Resume Data

After the server renders HTML, Marko embeds only the state needed to [resume](./why-is-marko-fast.md#resumability) in the browser. Smaller serialized payloads mean less HTML and less work on first interaction.

Prefer patterns that keep values off the resume path:

- Keep UI state [local](./nested-reactivity.md#case-1-local-state) instead of hoisting everything into a root object.
- Use [immutable, serializable data](./immutable-state.md) in `<let>` tags. Class instances and DOM nodes cannot cross the boundary cleanly.
- Prefer [`static`](../reference/language.md#static) / [`server`](../reference/language.md#server-and-client) for values that never change after load.
- Prefer [`<show>`](../reference/core-tag.md#show) when content stays mounted and only toggles visibility; prefer [`<if>`](../reference/core-tag.md#if--else) when hidden content should not render at all.
- Avoid storing derived values that can be recomputed with [`<const>`](../reference/core-tag.md#const).

```marko
// ✅ local draft state never needs a parent update path
<let/draft="">
<input value:=draft placeholder="Filter">

// ✅ derived values recompute; no extra source of truth
<const/visible=items.filter((item) => item.name.includes(draft))>
```

For a full list of supported and unsupported values, see [Serializable State](./serializable-state.md).

## Client JavaScript Size

Client bundles grow with interactivity, not with how many tags the template is split into. See [Fine-Grained Bundling](./fine-grained-bundling.md).

When interactive code is still large:

- [Lazy load](../reference/lazy-loading.md) heavy tags with `with { load: "visible#sel" }`, `idle`, `media(...)`, or event triggers.
- Keep event handlers and [`<script>`](../reference/core-tag.md#script) / [`<lifecycle>`](../reference/core-tag.md#lifecycle) work thin; prefer declarative state and `<const>` over effects.
- Import browser-only libraries with [`client import`](../reference/language.md#server-and-client) so they never land in the server graph.

```marko
import PriceChart from "<price-chart>" with { load: "visible#chart" }

<section#chart>
  <try>
    <PriceChart symbol=input.symbol/>
    <@placeholder>Loading chart...</@placeholder>
  </try>
</section>
```

## Production Builds

Development builds include extra checks, descriptive names, and clearer errors. Production sets `NODE_ENV=production` (or the bundler's production mode) so those paths are stripped and output is minified.

[Marko Run](../marko-run/cli.md) production output comes from `marko-run build`. Other integrations should build with the same production flags used for the rest of the app.

## Profiling

### Server-side

Measure time to first byte and time to last byte under realistic data latency. Streaming only helps if the response is not buffered by a proxy, CDN, or compression layer; see [Streaming troubleshooting](./streaming.md#troubleshooting--common-pitfalls).

Useful signals:

- How soon the document shell flushes relative to slow backend calls
- Whether independent `<await>` regions resolve in parallel
- HTML size, including serialized resume data in the response

### Client-side

Use browser performance tools after a production build:

- Main-thread time between first paint and first interaction
- JavaScript transferred and executed on the critical path
- Whether below-the-fold widgets load only after their [lazy triggers](../reference/lazy-loading.md#triggers)

The [playground](/playground) can show compiled client and server output for a single template when diagnosing unexpected interactivity or serialization.

## Further Reading

- [Why is Marko Fast?](./why-is-marko-fast.md)
- [Serializable State](./serializable-state.md)
- [HTML Streaming](./streaming.md)
- [Lazy Loading](../reference/lazy-loading.md)
- [Data Loading (Marko Run)](../marko-run/data-loading.md)
