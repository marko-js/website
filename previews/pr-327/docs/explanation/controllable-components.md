# Controllable Components

> [!TLDR]
>
> - **Controlled** components take their state from parent `input` props
> - **Uncontrolled** components manage internal state directly
> - **Controllable** components default to uncontrolled and become controlled when given a change handler
> - Native tags and `<let>` implement this pattern via change handlers, with optional `:=` shorthand

Component authors rarely know in advance whether every caller will want to hoist state or leave it internal. Rather than forcing a permanent choice between [**controlled** and **uncontrolled**](https://react.dev/learn/sharing-state-between-components#controlled-and-uncontrolled-components) APIs, Marko makes controllability a first-class language pattern.

## Uncontrolled Components

An uncontrolled component owns its state internally through [`<let>`](../reference/core-tag.md#let):

```marko
/* tags/counter.marko */
<let/count=0/>

<button onClick() { count++ }>
  Count: ${count}
</button>
```

```marko
/* parent.marko */
<counter/>

// 🤔 How can we access `count` out here?
<output>${count}</output>
```

Because `count` lives inside `counter.marko`, callers use `<counter/>` with zero boilerplate, but a parent cannot read or reset `count` externally.

### State Synchronization

A common workaround is keeping internal state in `<counter>` while notifying the parent through an event callback:

> [!WARNING]
> Mirroring child state into parent state is an anti-pattern. Prefer [the controllable pattern](#the-controllable-pattern) so only one source of truth exists.

```marko
/* tags/counter.marko */
export interface Input {
  onChange: (count: number) => void;
}

<let/count=0/>

<button onClick() { input.onChange(++count) }>
  Count: ${count}
</button>
```

```marko
/* parent.marko */
<let/count=0/>

<counter onChange(newCount) { count = newCount }/>
<output>${count}</output>
```

This creates two `count` variables that must be kept in sync manually and can drift whenever either side changes independently.

## Controlled Components

A controlled component delegates state ownership entirely to its parent:

```marko
/* tags/counter.marko */
export interface Input {
  count: number;
  countChange: (count: number) => void;
}

<button onClick() { input.countChange(input.count + 1) }>
  Count: ${input.count}
</button>
```

```marko
/* parent.marko */
<let/count=0/>

<counter count=count countChange(newCount) { count = newCount }/>
```

The parent has full control, but every caller must now allocate state and pass a `countChange` callback even when it never reads `count`.

## The Controllable Pattern

A **controllable** component behaves as [uncontrolled](#uncontrolled-components) by default and switches to [controlled](#controlled-components) whenever the caller supplies a `<prop>Change` handler.

### Controllable Native Tags

Stateful HTML elements follow this exact model in Marko via [change handlers](../reference/native-tag.md#change-handlers). Adding `valueChange=` hands ownership of an `<input>` to Marko state, and the [binding shorthand](../reference/language.md#shorthand-change-handlers-two-way-binding) `:=` writes both attributes together:

```marko
<let/textValue="">

<input value=textValue valueChange(v) { textValue = v }>

// equivalent with binding shorthand
<input value:=textValue>
```

### Controllable `<let>`

[`<let>` is itself controllable](../reference/core-tag.md#controllable-let). Binding it to `input.count` with `:=` (shorthand for `<let/count=input.count valueChange=input.countChange>`) makes `<counter>` work in both modes:

```marko
/* tags/counter.marko */
export interface Input {
  count: number;
  countChange?: (count: number) => void;
}

<let/count:=input.count>

<button onClick() { count++ }>
  Count: ${count}
</button>
```

```marko
/* parent.marko */
<let/parentCount=0>

// Controlled: `parentCount` is the source of truth
<counter count:=parentCount/>
<output>${parentCount}</output>

// Uncontrolled: counter manages its own state starting at 0
<counter count=0/>
```

When `countChange` is a function (passed explicitly or via `:=`), `<let>` delegates updates to `countChange` and reflects `input.count`. When `countChange` is `undefined`, `<let>` manages local state initialized from `input.count`.

To make `count?: number` optional with a default value so callers can write `<counter/>`, pass `value=` and `valueChange=` explicitly since `:=` cannot take a fallback such as `?? 0`:

```marko
<let/count=(input.count ?? 0) valueChange=input.countChange>
```

### Refining Functions

Insert a [refining function](../reference/language.md#refining-function) (`:fn:=`) to transform incoming values before assignment, such as parsing strings from native inputs into numbers or normalizing text:

```marko
<let/num=0/>
<input type="range" value:parseFloat:=num>
```

Custom functions work identically:

```marko
<let/text="HELLO">
<input value:uppercase:=text>

static function uppercase(str: string) {
  return str.toUpperCase();
}
```

## Custom Control Logic

Because a controlled parent intercepts every update through `countChange`, it can clamp values, validate input, or confirm changes without modifying `<counter>`:

```marko
<let/count=0>

<counter
  count=count
  countChange(next) {
    count = Math.min(5, next);
  }
/>
```

## Further Reading

- [Nested Reactivity](./nested-reactivity.md)
- [Separation of Concerns](./separation-of-concerns.md)
