# Fine-Grained Bundling

> [!TLDR]
> - Marko bundles only interactive JavaScript at compile time
> - Static content requires zero client-side JavaScript
> - Bundle size depends on interactivity, not architecture

Marko uses **compile-time analysis** to generate minimal JavaScript bundles by identifying which parts of templates actually need interactivity. Instead of shipping entire component trees, only the code necessary for dynamic behavior reaches the browser. This means that Marko is **zero-JS by default**, and interactive pages only ship JavaScript for the parts that truly need it.

## Sub-Component Islands

From the beginning, Marko has used the [islands architecture](https://www.patterns.dev/vanilla/islands-architecture/) to reduce JavaScript in each page bundle. In early versions, islands were determined at the **component** level. If any part of a component (Marko 5 and below) was interactive, then it was marked as a "client component" and its JavaScript was included.

Marko 6 and the Tags API extended this by determining islands at the **sub-component** level.

Consider a component that includes an interactive "watch" button:

```marko
/* shop-item.marko */
<div>
  <img src=input.image alt=input.name>
  <h3>${input.name}</h3>
  
  // Interactive toggle
  <let/watching:=input.watching>
  <button onClick() { watching = !watching }>
    ${watching ? "watching" : "watch"}
  </button>
</div>
```

Only the JavaScript for toggling `watching` and updating the button text is included. JavaScript for rendering static content or creating the button element is not included.

## Automatic Optimization

Marko's compiler automatically determines what needs JavaScript without manual configuration.

Whether an application is structured as one large component or split into many small ones, the bundle size remains the same—determined purely by the amount of interactivity, not by component architecture. The compiler extracts only the interactive portions regardless of how the code is organized. This way, component can be split up according to [separation of concerns](./separation-of-concerns.md).

This creates a development experience where good performance emerges naturally from the compilation process. Architectural decisions become about maintainability and developer experience, while the compiler handles optimization automatically.

