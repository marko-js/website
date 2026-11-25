<!-- markdownlint-disable-next-line MD026 punctuation -->
# Welcome to Marko!

Marko is a declarative, HTML-based language designed for fast, maintainable web applications.

## Beyond Vanilla HTML

Plain HTML, CSS, and JavaScript excel at static documents, but complex interfaces expose three structural limits: imperative DOM updates tangle state with presentation, global CSS creates naming collisions, and manual DOM coordination degrades both maintainability and performance as features grow.

Marko addresses these limits by extending HTML itself with components, reactive state, and compile-time optimization.

## Declarative Language

Marko templates describe what the interface renders for a given state rather than the imperative steps to mutate the DOM.

### Components

Every `.marko` file is a reusable component that composes like a native HTML tag.

```marko
/* tags/hello.marko */
export interface Input {
  name: string;
}

<h1>Hello, ${input.name}</h1>
```

```marko
/* index.marko */
<hello name="Marko"/>
```

### State Management

State lives directly in markup through [tag variables](../reference/language.md#tag-variables). Reassigning state propagates updates automatically, while event handlers and [`<script>`](../reference/core-tag.md#script) blocks handle side effects.

```marko
<let/count=0>
<button onClick() { count++ }>
  ${count}
</button>
```

## Performance-First Architecture

Marko shifts framework overhead from the browser to the build step.

### Targeted Compilation

Each template compiles twice: once for the server and once for the browser. Server output concatenates strings directly into an HTML stream for maximum throughput; browser output targets bundle size and ships code only for expressions that can change on the client.

```marko
<let/expanded=false>

<div>
  <p>Static markup renders on the server and ships zero client JavaScript.</p>
  <button onClick() { expanded = !expanded }>Toggle details</button>
  <if=expanded>
    <p>Only this branch and its state ship to the browser.</p>
  </if>
</div>
```

### Fine-Grained Reactivity

The compiler traces dependencies between state and DOM nodes at build time. When state changes, the browser updates only the affected nodes with no virtual DOM diffing or runtime dependency tracking.

### Streaming

Marko streams HTML to the browser as chunks become ready. Both in-order and out-of-order streaming are built into the language with [`<await>`](../reference/core-tag.md#await) and [`<try>`](../reference/core-tag.md#try).

```marko
<header>Sent immediately</header>
<try>
  <await=new Promise((resolve) => setTimeout(resolve, 500))>
    <p>Streamed after 500ms</p>
  </await>
  <@placeholder>
    <p>Loading...</p>
  </@placeholder>
</try>
```

### Resumability

Alongside streamed HTML, Marko serializes only the state needed for interactivity. The browser attaches event listeners and resumes from the server-rendered DOM without re-executing component setup or re-rendering templates.

## The Marko Mindset

Write declarative HTML first, introduce state and components where needed, and let the compiler handle server streaming, code splitting, and DOM updates.

## Next Steps

- [Installation](./installation.md)
- [Why Marko?](./why-marko.md)
- [Marko Fundamentals](../tutorial/fundamentals.md)
