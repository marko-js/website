# Targeted Compilation

> [!TLDR]
>
> - Marko compiles every template separately for server and browser environments
> - Server output concatenates strings directly into an HTML stream
> - Client output generates surgical DOM updates for interactive expressions only

Server-side rendering and client-side interactivity have fundamentally different performance constraints. Rather than running one runtime in both places, Marko compiles each template into two specialized outputs tailored to its target environment.

## Server Compilation

On the server, templates compile to direct string concatenation written into an HTML stream, avoiding DOM or virtual tree allocation altogether:

```marko
<article>
  <h2>${input.title}</h2>
  <if=input.featured>
    <span class="badge">Featured</span>
  </if>
</article>
```

Static markup is pre-concatenated at build time, dynamic values are escaped inline, and conditionals compile to direct branches integrated with [HTML streaming](./streaming.md).

## Client Compilation

In the browser, templates compile to direct DOM updates scoped strictly to interactive expressions:

```marko
<article>
  <h2>${input.title}</h2>

  // Interactive like toggle
  <let/liked:=input.liked>
  <button class=(liked && "liked") onClick() { liked = !liked }>
    ${liked ? "❤️ liked" : "🤍 like"}
  </button>
</article>
```

When this component renders on the server, the browser bundle contains only the `liked` state, click handler, and update code for the button's class and text. Static markup such as `${input.title}` produces zero client JavaScript.

## Environment Coordination

Server and browser outputs coordinate seamlessly through [fine-grained bundling](./fine-grained-bundling.md) and serialized resume markers:

```marko
// Static
<h1>${input.title}</h1>

// Interactive
<let/active=0>
<div>
  <for|section, i| of=input.sections>
    <button
      aria-selected=(i === active && "true")
      onClick() { active = i }
    >
      ${section.title}
    </button>
  </for>
</div>

// Static content toggled by interactive state
<for|section, i| of=input.sections>
  <div hidden=(i !== active)>${section.body}</div>
</for>
```

Server output renders the complete HTML document, including the heading and all tab panels. When server-rendered, client output ships only the tab-switching handler and `aria-selected` / `hidden` updates, with no code for creating the heading or tab bodies.

## Benefits

Templates are authored once while each environment executes code shaped for its workload: single-pass string streaming on the server, and direct DOM updates with zero unused rendering logic in the browser.

Because client bundles grow only with interactivity rather than total markup, pages stay lean as applications scale while keeping progressive enhancement intact by default.
