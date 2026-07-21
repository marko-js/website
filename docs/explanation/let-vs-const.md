# `<let>` vs `<const>` vs `static`

> [!TLDR]
>
> - [`<let>`](../reference/core-tag.md#let): mutable reactive state
> - [`<const>`](../reference/core-tag.md#const): derived value, pure, recomputes with dependencies
> - [`static`](../reference/language.md#static): module-level code, runs once per process, not reactive

Templates mix three ways to name values. Choosing the right one keeps updates cheap and intent obvious.

## Mutable State: `<let>`

[`<let>`](../reference/core-tag.md#let) introduces state. Assignment updates the value and schedules every expression that depends on it.

```marko
<let/count=0>

<button onClick() { count++ }>
  Clicked ${count} times
</button>
```

The `value=` attribute is only the initial value unless the tag is [controllable](../reference/core-tag.md#controllable-let). Later changes to that expression do not overwrite the current state.

Use `<let>` when something can change over time: form drafts, toggles, lists the user edits, or values synchronized with a parent through `valueChange=`.

## Derived Values: `<const>`

[`<const>`](../reference/core-tag.md#const) names a pure expression of other reactive values. When those dependencies change, the const recomputes. There is no assignment to a const tag variable.

```marko
<let/price=10>
<let/qty=2>
<const/total=price * qty>

<p>Total: ${total}</p>
```

> [!WARNING]
> Do not mirror state through an effect. If a value can be computed from other state, use `<const>` instead of a `<script>` or `<lifecycle>` that writes back into a `<let>`.

`<const>` is also the usual place for pure helper functions used as event handlers or refining functions:

```marko
<let/name="">
<const/onReset() { name = "" }>

<button onClick=onReset>Clear</button>
```

## Module Scope: `static`

[`static`](../reference/language.md#static) (and plain `import` / `export`) runs once when the template module loads. It is not part of the reactive graph and is not re-run per instance.

```marko
static const TAX_RATE = 0.08;
static function formatMoney(n) {
  return n.toFixed(2);
}

<let/subtotal=0>
<const/tax=subtotal * TAX_RATE>

<p>Tax: ${formatMoney(tax)}</p>
```

[`server`](../reference/language.md#server-and-client) and [`client`](../reference/language.md#server-and-client) are environment-scoped variants of the same idea: module-level code that only exists on one side of the network.

| Construct | Per instance? | Reactive?     | Assignable?   |
| --------- | ------------- | ------------- | ------------- |
| `<let>`   | Yes           | Yes           | Yes           |
| `<const>` | Yes           | Yes (derived) | No            |
| `static`  | No (module)   | No            | N/A (JS rules)|

## Choosing

1. User or time can change it → `<let>`
2. It is determined by other reactive values → `<const>`
3. It is shared configuration, a pure utility, or a one-time import → `static` / `import`

## Further Reading

- [Reactivity](../reference/reactivity.md)
- [Core Tags: `<let>` / `<const>`](../reference/core-tag.md#let)
- [Language: `static`, `server`, `client`](../reference/language.md#static)
