# Environment-Based Compilation

> [!TLDR]
> - Marko compiles templates differently for server versus client environments.
> - Server compilation optimizes for rendering speed through string operations.
> - Client compilation optimizes for minimal bundle size with targeted DOM updates.
> - Both environments coordinate seamlessly for progressive enhancement.

Marko's compiler intelligently generates different code based on the target environment, optimizing templates for their specific runtime constraints. This 
**dual-target approach** ensures maximum performance on both server and client without compromising developer experience or forcing architectural decisions.

Instead of using a one-size-fits-all compilation strategy, Marko recognizes that server-side rendering and client-side interactions have fundamentally different 
performance characteristics and optimization opportunities.

## Server Compilation

On the server, templates compile to string concatenation operations that build HTML through efficient string manipulation, avoiding DOM creation overhead entirely.

Consider this Marko template:

```marko
/* blog-post.marko */
<article class="post">
  <h2>${input.title}</h2>
  <p class="meta">By ${input.author} on ${input.date}</p>
  <div class="content">${input.content}</div>
  <if=input.featured>
    <span class="badge">Featured</span>
  </if>
  <else>
    <span class="status">Regular Post</span>
  </else>
</article>
```

The compiler generates code that pre-computes static markup, properly escapes and inserts dynamic values, and translates conditional logic to minimal branching that writes the appropriate HTML segments. This allows output to be written incrementally as data becomes available with no intermediate object creation.

Advanced optimizations include pre-computing static portions, optimizing loops for batch operations, and generating streaming-compatible code that works seamlessly with Marko's [HTML streaming](./streaming.md) capabilities.

## Client Compilation

When templates need interactivity, client compilation takes a completely different approach. Instead of generating full HTML rendering code, it produces minimal JavaScript for targeted DOM updates.

Using an interactive version of the template:

```marko
/* interactive-blog-post.marko */
<article class="post">
  <h2>${input.title}</h2>
  <p class="meta">By ${input.author} on ${input.date}</p>
  <div class="content">${input.content}</div>
  
  // Interactive like button
  <div class="actions">
    <let/liked:=input.liked>
    <let/likes:=input.likes>
    <button 
      class=liked && 'liked'
      onClick() { 
        liked = !liked;
        likes += liked ? 1 : -1;
      }
    >
      ${liked ? '❤️' : '🤍'} ${likes} likes
    </button>
  </div>
</article>
```

The compiler generates minimal JavaScript focused exclusively on interactive portions: reactive state management for declared variables, targeted update functions that modify only affected DOM nodes, and efficient event handlers that trigger necessary updates.

Static content (`input.title`, `input.author`, `input.content`) produces no client-side JavaScript because it doesn't change after initial render. This selective compilation dramatically reduces bundle sizes compared to frameworks that include rendering logic for all content.

## Environment Coordination

Server and client compilation work together seamlessly. The server renders complete initial HTML while the client receives only the minimal JavaScript needed for interactivity. This pattern aligns with [fine-grained bundling](./fine-grained-bundling.md).

Consider a documentation page mixing static and interactive content:

```marko
<div class="docs-page">
  // Static content: server-only
  <header>
    <h1>${input.title}</h1>
    <p class="description">${input.description}</p>
  </header>
  
  // Interactive content: server + client
  <let/activeTab=input.sections[0].id>
  <div class="tabs">
    <for|section| of=input.sections>
      <button 
        class=(activeTab === section.id && 'active')
        onClick() { activeTab = section.id }
      >
        ${section.title}
      </button>
    </for>
  </div>
  
  // Static content dependent on interactive state
  <div class="content">
    <for|section| of=input.sections>
      <div class=(activeTab === section.id ? 'visible' : 'hidden')>
        ${section.content}
      </div>
    </for>
  </div>
</div>
```

Server compilation renders the complete initial HTML including the header and initial tab state. Client compilation generates JavaScript only for tab switching logic and content visibility updates. The bundle includes only interactive tab selection logic, with no code for rendering the header or static content.

This coordination ensures users receive a fully functional page from the initial server response, with progressive enhancement adding interactivity only where needed.

## Benefits

Environment-based compilation delivers compound performance benefits that improve as applications scale.

Write components once using natural syntax while the compiler handles environment-specific optimizations automatically. No need to maintain separate server and client implementations or coordinate between different rendering approaches.

Server-side rendering achieves maximum throughput through string operations, while client-side updates achieve minimum overhead through targeted DOM manipulation. Each environment gets code optimized for its specific constraints.

Only interactive portions of applications generate client-side JavaScript, creating naturally optimal bundle sizes that scale with actual interactivity rather than codebase size. Applications function completely without JavaScript and enhance progressively, supporting diverse user environments while maintaining full functionality for all users.

This compilation strategy exemplifies Marko's philosophy of shifting complexity from runtime to build time, allowing developers to focus on features while the compiler automatically handles performance optimization across execution environments.