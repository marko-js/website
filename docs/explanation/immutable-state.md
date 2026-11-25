# Immutable Data in State

> [!TLDR]
>
> - Replacing values rather than mutating them triggers reactive updates reliably
> - Immutable state keeps rendered output a pure function of inputs and state
> - Plain serializable values enable server-to-client resumability

Marko's assignment-based reactivity expects state to be updated immutably with plain, serializable data. Treating rendered output as a deterministic function of inputs and state eliminates hidden side effects and keeps server-to-client handoff straightforward.

## Immutability

Marko detects changes when a [`<let>`](../reference/core-tag.md#let) tag variable is reassigned and checked by reference equality (`===`). Creating a new array or object makes each state change explicit and triggers dependent DOM updates:

```marko
<let/items=["alpha", "beta"]>

<ul>
  <for|item| of=items>
    <li>${item}</li>
  </for>
</ul>
<button onClick() {
  // ❌ in-place mutation keeps the same reference and does not trigger updates
  items.push("gamma");

  // ✅ immutable reassignment triggers a reactive update
  items = items.concat("gamma");
}>Add</button>
```

## Functional UI

Because every update replaces the state reference rather than mutating fields behind the scenes, any expression reading that state always reflects a consistent snapshot:

```marko
<let/user={ name: "Ada", clicks: 0 }>

<p>Hello, ${user.name}! (${user.clicks} clicks)</p>
<button onClick() {
  // ❌ in-place mutation
  user.clicks++;

  // ✅ immutable update
  user = { ...user, clicks: user.clicks + 1 };
}>
  Visit
</button>
```

## Serialization

Resuming server-rendered HTML in the browser requires serializing any state that client code reads. Keeping state as plain objects, arrays, and supported built-ins rather than custom class instances or DOM nodes ensures reliable server-to-client transfer. See [Serializable State](./serializable-state.md) for the full list of supported types.

## Further Reading

- [Reactivity](../reference/reactivity.md)
- [Nested Reactivity](./nested-reactivity.md)
- [Fine-Grained Bundling](./fine-grained-bundling.md)
