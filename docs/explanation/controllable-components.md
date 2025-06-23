# Controllable Components

> [!TLDR]
>
> - **Controlled** components are driven by `input` props
> - **Uncontrolled** components are driven by internal state
> - **Controllable** components can be both controlled _and_ uncontrolled
> - Marko provides first-class patterns for building controllable components

In component-based frameworks, developers must know where the _source of truth_ is for state. Typically, a decision is made at the component level about whether it should be [**controlled** or **uncontrolled**](https://react.dev/learn/sharing-state-between-components#controlled-and-uncontrolled-components).

## Uncontrolled Components

Uncontrolled components manage their own state.

```marko
/* counter.marko */
<let/count=0/>

<button onClick() { count++ }>
  Count: ${count}
</button>
```

Because `<counter>` manages its own state (via `<let>`), it can be used anywhere without extra work.

```marko
/* parent.marko */
<counter/>
```

However, since the state is created in `counter.marko`, `count` can _only_ be accessed within the component. This means there's no way for a parent to use the state. For example, how might a parent use this count and display it elsewhere on the page?

```marko
/* parent.marko */
<counter/>

// 🤔 How can we access `count` out here?
<output>${count}</output>
```

This isn't possible with only modifications to `parent.marko`! Instead, we need to change `<counter>` to give more **control** to its parent.

### State synchronization

A naive approach for allowing parents to access state is to trigger events when updates happen.

> [!WARNING]
> This is an anti-pattern! It is **almost always better** to use [the controllable pattern](#the-controllable-pattern) for cases like this instead of synchronizing state

```marko
/* counter.marko */
export interface Input {
  onChange: (count: number) => void;
}

<let/count=0/>

<button onClick() {
  input.onChange(++count);
}>
  Count: ${count}
</button>
```

With this event handler, `parent.marko` could keep track of its own copy of `count`.

```marko
/* parent.marko */
<let/count=0/>

<counter onChange(newCount) { count = newCount }/>

<output>${count}</output>
```

This approach leaves room for error:

- We have _two_ `count` variables that must stay synchronized
- If these variables get out of sync, our website will be broken
- We must track _all_ changes in `<counter>` and synchronize them in the parent

As we'll discuss later, most stateful [native HTML elements](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements) use this "uncontrolled with state synchronization" approach by default. Marko [extends](../reference/native-tag.md#change-handlers) these tags to enable [the controllable pattern](#the-controllable-pattern).

### Controlled Components

Controlled components receive state from their parent and delegate changes back up the component tree.

```marko
/* counter.marko */
export interface Input {
  count: number;
  updateCount: (count: number) => void;
}

<button onClick() { input.updateCount(input.count + 1) }>
  Count: ${input.count}
</button>
```

If this `<counter>` component is used directly, it won't be interactive! To manage `<counter>` effectively, we need to _create state in the parent_.

```marko
/* parent.marko */
<let/count=0/>

<counter
  count=count
  updateCount(newCount) { count = newCount }
/>
```

This is great because the parent has full control over component state, but it has trade-offs:

- _Every_ parent of `<counter>` needs this boilerplate, even if they don't use `count`
- This refactor was only possible because _we_ authored `<counter>` and can change its API

## The Controllable Pattern

Ultimately, at _component authoring time_ it's impossible to know whether we want state to be controlled or uncontrolled. It may need to be controlled _sometimes_ but otherwise manage its own state. For these cases, Marko introduces the **controllable** pattern.

Controllable components are [uncontrolled](#uncontrolled-components) by default, but with a change handler they become [controlled](#controlled-components).

Before digging into our `<counter>` example and making it controllable, let's explore what this pattern looks like on native elements.

### Controllable Native Tags

Most native HTML elements follow the [uncontrolled](#uncontrolled-components) pattern by default, but Marko enhances them with [change handlers](../reference/native-tag.md#change-handlers) to enable the [controlled](#controlled-components) pattern.

To take control of a stateful HTML element, we can add a `Change` handler.

```marko
<let/textValue="">

<input value=textValue valueChange(v) { textValue = v }>
```

Since `valueChange` is present, Marko knows this `<input>` is **controlled** and its value will always derive from `textValue`. This is called **binding**.

Because this is a common pattern, Marko provides a [binding shorthand](../reference/language.md#shorthand-change-handlers-two-way-binding) using the `:=` operator.

```marko
<let/textValue="">

<input value:=textValue>
```

> [!NOTE]
> The [binding shorthand](../reference/language.md#shorthand-change-handlers-two-way-binding) acts differently when used with an _identifier_ versus a _member expression_. Above is the identifier behavior; we'll see the member expression behavior next.

### Controllable `<let>`

We want our `<counter>` tag to follow the same controllable pattern as native tags like `<input>` in Marko. Let's take advantage of the fact that [`<let>` is _also_ controllable](../reference/core-tag.md#controllable-let).

```marko
/* counter.marko */
export interface Input {
  count: number;
  countChange?: (count: number) => void;
}

<let/count=input.count valueChange=input.countChange>

<button onClick() { count++ }>
  Count: ${input.count}
</button>
```

This component now has two behaviors, depending on the `<let>` tag's `valueChange`:

- When `countChange` is a function
  - `<let>` forfeits control of its state and acts as a derivation of `input.count`
- When `countChange` is `undefined`
  - `<let>` acts just as it did in our first example

```marko
/* parent.marko */
<let/parentCount=0>

// `parentCount` is the source of truth
<counter count=parentCount countChange(count) { parentCount = count }/>

// This one holds its own state
<counter/>
```

The [binding shorthand](../reference/language.md#shorthand-change-handlers-two-way-binding) accommodates both sides of this exchange, as it acts differently for identifiers and member expressions.

```marko
/* counter.marko */
export interface Input {
  count: number;
  countChange?: (count: number) => void;
}

<let/count:=input.count>

<button onClick() { count++ }>
  Count: ${input.count}
</button>
```

```marko
/* parent.marko */
<let/parentCount=0>

<counter count:=parentCount/>

<output>${count}</output>
```

## More Power

The controllable pattern allows the _user_ of a component to decide whether to manage state. Simple cases remain simple, but complex state management is also possible.

We've only scratched the surface! When a parent hoists state up, it takes _full_ control. This means we can add a max value:

```marko
/* parent.marko */
<let/count=0>

<counter count=count countChange(c) {
  if (c > 5) {
    count = 5;
  } else {
    count = c;
  }
}/>
```

or perform validation:

```marko
/* parent.marko */
<let/count=0>

<counter count=count countChange(c) {
  if (confirm("are you sure?")) {
    count = c;
  }
}/>
```

The key is that the _parent_ decides what to do with state. If components are designed with the controllable pattern, they can be used in various scenarios without requiring changes to the component itself.

## Further Reading

- [Nested Reactivity](./nested-reactivity.md)
- [Separation of Concerns](./separation-of-concerns.md)
