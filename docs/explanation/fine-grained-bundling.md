# Fine-Grained Bundling

> [!TLDR]
> - Marko bundles only interactive JavaScript at compile time
> - Static content requires zero client-side JavaScript
> - Bundle size depends on interactivity, not architecture

Marko uses **compile-time analysis** to generate minimal JavaScript bundles by identifying which parts of templates actually need interactivity. Instead of shipping entire component trees, only the code necessary for dynamic behavior reaches the browser. This means that Marko is **zero-JS by default**, and interactive pages only ship JavaScript for the parts that truly need it.

## Beyond Islands

Some frameworks, including older versions of Marko, use the [islands architecture](https://www.patterns.dev/vanilla/islands-architecture/) to reduce JavaScript in each page bundle. Islands are determined at the **component** level, so applications authored in an islands-based framework need clear distinction between _server_ components and _client_ components.

In Marko 6 the compiler decides which code to is interactive based on the _state_ tree, and only includes what is necessary in the browser bundle. Consider this tag that includes an interactive "watch" button:

```marko
/* shop-item.marko */
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

Only the JavaScript for toggling `watching` and updating the button text is included. JavaScript for rendering static content or creating the button element is not included.

## Automatic Optimization

Marko's compiler automatically determines what needs JavaScript without manual configuration.

Whether an application is structured as one large component or split into many small ones, the bundle size remains the same—determined purely by the amount of interactivity, not by component architecture. The compiler extracts only the interactive portions regardless of how the code is organized. This way, component can be split up according to [separation of concerns](./separation-of-concerns.md).

This creates a development experience where good performance emerges naturally from the compilation process. Architectural decisions become about maintainability and developer experience, while the compiler handles optimization automatically.

