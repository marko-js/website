# Targeted Compilation

> [!TLDR]
> - Marko chooses what to compile to based on the environment
> - String concatenation on the server
> - DOM manipulation on the client

Marko's compiler intelligently generates different code based on the target environment, optimizing templates for their specific runtime constraints. This dual-target approach ensures maximum performance on both server and client without compromising developer experience or forcing architectural decisions.

Instead of using a one-size-fits-all compilation strategy, Marko recognizes that server-side rendering and client-side interactions have fundamentally different
performance characteristics and optimization opportunities.

## Server Compilation

On the server, templates compile to string concatenation operations that build HTML through efficient string manipulation, avoiding DOM creation overhead entirely.

Consider this Marko template:

```marko
/* article.marko */
<article>
  <h2>${input.title}</h2>
  <if=input.featured>
    <span class="badge">Featured</span>
  </if>
</article>
```

The compiler pre-computes static markup, escapes and inserts dynamic values, and translates conditional logic to minimal branching that writes the appropriate HTML segments. Advanced optimizations include pre-evaluating static portions and ensuring server code works seamlessly with Marko's [HTML streaming](./streaming.md) capabilities.

## Client Compilation

When templates need interactivity, client compilation takes a different approach. Instead of generating full HTML rendering code, it produces minimal JavaScript for targeted DOM updates.

Consider this interactive version of the previous example:

```marko
/* article.marko */
<article>
  <h2>${input.title}</h2>

  // Interactive like toggle
  <let/liked:=input.liked>
  <button class=liked && 'liked' onClick() { liked = !liked }>
    ${liked ? '❤️ liked' : '🤍 like'}
  </button>
</article>
```

The compiler generates minimal JavaScript focused exclusively on interactive portions: reactive state for declared variables, targeted update functions that modify only affected DOM nodes, and event handlers that trigger necessary updates.

Static content such as `${input.title}` produces no client-side JavaScript because it does not change after initial render.

## Environment Coordination

Server and client compilation work together seamlessly. The server renders complete initial HTML while the client receives only the minimal JavaScript needed for interactivity. This pattern aligns with [fine-grained bundling](./fine-grained-bundling.md).

Consider a tabs component that mixes static and interactive content:

```marko
/* tabs.marko */
// Static
<h1>${input.title}</h1>

// Interactive
<let/active=0>
<div>
  <for|section, i| of=input.section>
    <button
      aria-selected=(i === active && 'true')
      onClick() { active = i }
    >
      ${section.title}
    </button>
  </for>
</div>

// Static content dependent on interactive state
<for|section, i| of=input.section>
  <div hidden=(i !== active)>${section.content}</div>
</for>
```

Server compilation renders the initial HTML, including the header and initial tab state. Client compilation generates JavaScript only for tab switching and visibility updates. The bundle includes no code for rendering the static header or static tab content.

## Benefits

Targeted compilation delivers compound performance benefits that improve as applications scale.

Components are written once using natural syntax, while the compiler handles environment-specific optimizations automatically. There is no need to maintain separate server and client implementations or coordinate between different rendering approaches.

Server-side rendering achieves maximum throughput through string operations, while client-side updates achieve minimum overhead through targeted DOM manipulation. Each environment gets code optimized for its specific constraints.

Only interactive portions of applications generate client-side JavaScript, creating naturally optimal bundle sizes that scale with actual interactivity rather than codebase size. Applications function completely without JavaScript and enhance progressively, supporting diverse user environments while maintaining full functionality for all users.

This compilation strategy exemplifies Marko's philosophy of shifting complexity from runtime to build time, allowing developers to focus on features while the compiler automatically handles performance optimization across execution environments.
