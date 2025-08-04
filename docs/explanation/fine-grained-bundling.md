# Fine-Grained Bundling

> [!TLDR]
> - Marko bundles only interactive JavaScript at compile time
> - Static content requires zero client-side JavaScript
> - Bundle size depends on interactivity, not architecture

Marko uses **compile-time analysis** to generate minimal JavaScript bundles by identifying which parts of templates actually need interactivity. Instead of shipping entire component trees, only the code necessary for dynamic behavior reaches the browser. This means that Marko is **zero-JS by default**, and interactive pages only ship JavaScript for the parts that truly need it.

## Sub-Component Islands

From the beginning, Marko has used the [islands architecture](https://www.patterns.dev/vanilla/islands-architecture/) to reduce JavaScript in each page bundle. In early versions, islands were determined at the **component** level. If any part of a component (Marko 5 and below) was interactive, then it was marked as a "client component" and its JavaScript was included.

The innovation in version 6 and the Tags API is that, with its smart compiler, Marko can determine where islands should be at the _sub-component_ level.

Consider an application that includes a `<shop-item>` component, which is mostly static but includes an interactive "watch" button:

```marko
/* shop-item.marko */
<div>
  // static content
  <img src=input.image alt=input.name>
  <h3>${input.name}</h3>
  <p class="price">$${input.price}</p>
  <p class="description">${input.description}</p>

  // interactive "watch" button
  <let/watching:=input.watching>
  <button onClick() { watching = !watching }>
    ${watching ? "watching" : "watch"}
  </button>
</div>
```

When this component is rendered, the only JavaScript included will be the logic for toggling the `watching` state and for updating the text node in the `button` component. Marko will _not_ include JavaScript for rendering any of the static content, or even for creating the button that the click event will be attached to.

> [!NOTE]
> This **sub-component granularity** goes beyond traditional islands architecture, which typically operates at the component level.

## Automatic Optimization

Marko's compiler intelligence automatically determines what needs JavaScript without any manual configuration. This means developers can focus on building features rather than optimizing bundle boundaries.

Whether an application is structured as one large component or split into many small ones, the bundle size remains the same—determined purely by the amount of interactivity, not by component architecture. The compiler extracts only the interactive portions regardless of how the code is organized.

Whether an application is structured as one large component or split into many small ones, the bundle size remains the same—determined purely by the amount of interactivity, not by component architecture. The compiler extracts only the interactive portions regardless of how the code is organized. This way, component can be split up according to [separation of concerns](./separation-of-concerns.md).

This creates a development experience where good performance emerges naturally from the compilation process. Architectural decisions become about maintainability and developer experience, allowing teams to focus on building great user experiences while the compiler handles optimization automatically.

