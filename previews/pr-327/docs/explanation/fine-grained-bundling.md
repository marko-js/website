# Fine-Grained Bundling

> [!TLDR]
>
> - Marko analyzes templates at compile time to bundle only interactive JavaScript
> - Static markup ships zero client-side JavaScript
> - Bundle size scales with interactivity rather than component boundaries

Marko uses **compile-time analysis** to determine which expressions in a template can change in the browser. Static markup renders on the server and ships zero client JavaScript, so browser bundles contain only the code required for interactive behavior.

## Beyond Islands

[Islands architectures](https://www.patterns.dev/vanilla/islands-architecture/) reduce client JavaScript at the **component** boundary, requiring explicit separation between server components and client components.

Marko analyzes reactivity at the **expression** level across the state graph. Consider a product card containing a single interactive toggle:

```marko
<div>
  <h3>${input.name}</h3>
  <${input.content}/>

  // Interactive toggle
  <let/watching:=input.watching>
  <button onClick() { watching = !watching }>
    ${watching ? "watching" : "watch"}
  </button>
</div>
```

Only the click listener, `watching` state, and button text update ship to the browser. Code for rendering the heading, wrapping `<div>`, and static content stays on the server.

## Architecture Independence

Because the compiler traces reactivity across component boundaries, splitting one template into many small components (or combining several into one) produces the same browser bundle size. Component boundaries follow [separation of concerns](./separation-of-concerns.md) without imposing hydration or bundle penalties.

When interactive JavaScript itself should wait until needed (such as for a heavy below-the-fold widget), tags can be [lazily loaded](../reference/lazy-loading.md) into separate bundles with declarative triggers.
