# Optimizing Performance

> [!TLDR]
>
> - Run production builds with `NODE_ENV=production` so Marko strips debug checks and shortens internal IDs
> - Pass promises into `<await>` rather than awaiting upstream to preserve streaming
> - Keep reactive state narrow and lazy-load heavy below-the-fold widgets

Marko's compiler applies streaming, fine-grained bundling, and compile-time reactivity automatically, so most templates are fast by default. When profiling reveals bottlenecks, focus on build configuration, async boundaries, client bundle scope, and serialized resume payloads.

## Production Mode

Ensure production builds compile with `NODE_ENV=production` (or `optimize: true` in [`@marko/compiler`](../reference/compiler.md#optimize)). Production mode switches templates from the debug runtime to the optimized runtime, strips debug checks, and shortens internal template and scope identifiers.

## Promise Passing

Start independent data fetches in parallel and pass their promises directly into [`<await>`](../reference/core-tag.md#await) tags rather than awaiting them before rendering. Awaiting in a route handler or middleware holds back the entire HTML response, forfeiting [streaming](./streaming.md) for static markup and `<head>` assets. See [Promises over Awaiting](../marko-run/data-loading.md#promises-over-awaiting).

## Client Bundle Size

Because Marko [bundles only interactive expressions](./fine-grained-bundling.md), client JavaScript grows only with client-side state:

- Use the narrowest variable declaration that fits: [`static const`](../reference/language.md#static) for constants shared across instances, [`<const>`](../reference/core-tag.md#const) for derived values, and [`<let>`](../reference/core-tag.md#let) only for mutable state (see [`<let>` vs `<const>`](./let-vs-const.md)).
- Choose [`<show>`](../reference/core-tag.md#show) when toggling bulky static markup that is already server-rendered so the browser does not bundle template creation code just to toggle visibility; choose [`<if>`](../reference/core-tag.md#if--else) when hidden branches should not render on the server.
- Defer heavy interactive components (charts, rich editors, below-the-fold widgets) with [lazy loading](../reference/lazy-loading.md) (`with { load: "visible..." }` or `with { load: "idle" }`).

## Reducing Hydration Data

Marko serializes only the values read by browser code, embedded inline in the HTML for resumability. Keeping reactive state lean shrinks both HTML transfer size and browser parse time:

- Pass only the fields a client interaction actually reads rather than whole database records into interactive tags or event handlers.
- Keep server-only values out of [`$global.serializedGlobals`](../reference/template.md#globalserializedglobals).
- See [Serializable State](./serializable-state.md) for how shared references and streaming flushes serialize.

## Profiling

On the server, profile template throughput with Node's `--cpu-prof` flag or the Node Inspector under `NODE_ENV=production` to separate rendering cost from upstream I/O latency.

In the browser, inspect bundle composition with Vite's bundle visualizer, view compiled client output in the [Playground](/playground) ("Client JS" tab), and measure interaction cost in browser DevTools.
