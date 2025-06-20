# Welcome to Marko!

Marko is a language designed to make it easier to write performant and "correct" websites. It offers a unique and compelling approach to web development, built upon core principles and features that set it apart.

## What's Missing from Vanilla HTML, CSS, and JavaScript?

The rise of frameworks in the frontend ecosystem didn't happen for no reason— for complex applications, vanilla technologies fall short in a few important areas.

- **Scalability**: Maintaining large applications is challenging due to the imperative nature of JavaScript and the global scope of CSS
- **Performance**: Manual DOM manipulation is unwieldy and hard to follow, and it can lead to performance bottlenecks unless executed properly
- **Maintainability**: Verbose HTML and complex JavaScript logic can make codebases difficult to understand and maintain

Frameworks and languages for the web address these issues through concepts like component-based architecture, declarative UI, and managed state. Marko provides a familiar but unique solution for each of these common problems.

## Declarative Language

Marko embraces a declarative approach, allowing developers to describe what the UI should look like instead of how it should be rendered. This paradigm enables powerful compiler optimizations and simplifies state management.

### Components

Marko's component model promotes reusability and modularity, simplifying the construction of complex UIs.

```marko
/* hello.marko */
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

The Marko language allows developers to declare state within markup, which automatically propagates updates, while imperative blocks and statements allow for control over side effects.

```marko
<let/count=0>
<button onClick() { count++ }>
  ${count}
</button>
```

## Performance-first Architecture

Marko prioritizes performance at the architectural level, maximizing developer experience while ensuring that the experience of the website's users is never sacrificed.

### Targeted Compilation

Marko compiles every template twice— once for the server, and once for the browser. Server code is optimized for speed, while client code is optimized for bundle size. At compile time, the Marko compiler also figures out which parts of your application _need_ to be sent to the client and which can stay on the server.

```marko
<div>
  <p>
    This paragraph isn't stateful, so it will be rendered by the server in raw HTML
  </p>
  <if=someState>
    This section depends on state, so JavaScript will be included about how to manage it
  </if>
</div>
```

#### Fine-grained Reactivity

Marko determines at compile time which changes need to happen to the page whenever state is updated, so granular updates are ensured to improve client-side performance.

### Streaming

Marko takes advantage of HTML streaming to send content to the client as soon as it becomes available. Both in-order _and_ out-of-order streaming are supported, enabling developers to decide how to show content as quickly as possible.

```marko
<header>Sent immediately</header>
<await=Promise((res) => setTimeout(res, 500))>
  <p>Sent after 500 milliseconds</p>
</await>
```

### Resumability

When Marko streams HTML, it also includes serialized values for state so the client can pick up where the server left off without performing any extra calculations. This ensures a faster time-to-interactive and reduced client-side JavaScript.

## The Marko Mindset

Marko aims to provide a developer experience that feels as close to writing declarative HTML as possible, while enabling the capabilities of complex applications.

## Next Steps

- [Installation](./installation.md)
