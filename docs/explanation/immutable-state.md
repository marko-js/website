# Immutable Data in State

> [!TLDR]
> - Immutable updates prevent hidden side effects
> - UI as a function of state requires immutability
> - Server-to-client handoff needs serializable state

Marko encourages treating application state as immutable, plain data. This aligns the render model with functional programming: the UI is a deterministic function of inputs and state. It also allows the compiler and runtime to optimize updates and safely hand work between server and client.

## Immutability

Immutable updates replace data instead of mutating it in place. This avoids hidden coupling, makes changes easier to reason about, and ensures updates are detected.

Consider this Marko template. Reassigning the array triggers an update; mutating in place does not.

```marko
/* list.marko */
<let/items=["alpha", "beta"]>

<ul>
  <for|item| of=items>
    <li>${item}</li>
  </for>
  <button onClick() {
    // ❌ BAD: in-place mutation
    items.push("gamma")

    // ✅ GOOD: immutable update
    items = items.concat("gamma");
  }>Add</button>
</ul>
```

Immutable updates work naturally with Marko's assignment-based reactivity. Replacing a value (object, array, map-like structure) makes change propagation explicit and reliable.

## Functional UI

In modern UI frameworks, developers are encouraged to view the **rendered output** as a **function of state**. This works when state changes are visible and do not carry implicit side effects. In-place mutation breaks that mental model and can hide when and where the view should update.

```marko
/* profile.marko */
<let/user={ name: "Ada", clicks: 0 }>

<p>Hello, ${user.name}! (${user.clicks} clicks)</p>

<button onClick() {
  // ❌ BAD: in-place mutation
  user.clicks++;

  // ✅ GOOD: immutable update
  user = { ...user, clicks: user.clicks + 1 };
}>Visit</button>
```

By replacing `user`, the view updates deterministically as a function of the new state.

## Serialization

To pass work from server to client, state must be serialized. Only plain, JSON-serializable data can be reliably embedded into HTML and later hydrated. Class instances, DOM nodes, and closures cannot be serialized and should not be stored in state.

```marko
/* cart.marko */
// ✅ GOOD: serializable data
<let/cart={ items: [{ id: 1, qty: 2 }] }>

// ❌ BAD: unserializable in state (class/function/DOM)
<let/cart=new Cart([{ id: 1, qty: 2 }])>
```

Keeping state serializable enables streaming HTML on the server and interactive handoff in the browser without brittle custom hydration logic.

> [!TIP]
> For details on what data is supported and patterns to avoid, see [serializable state](./serializable-state.md)

## Further Reading

- [Reactivity](../reference/reactivity.md)
- [Nested Reactivity](./nested-reactivity.md)
- [Fine-Grained Bundling](./fine-grained-bundling.md)
