# `<let>` vs `<const>`

> [!TLDR]
>
> - [`<let>`](../reference/core-tag.md#let): mutable reactive state
> - [`<const>`](../reference/core-tag.md#const): derived value, pure, recomputes with dependencies
> - [`static const`](../reference/language.md#static): module-level constant, initialized once, not reactive

A `.marko` template has three ways to bind a variable, each signaling how the value updates: [`<let>`](../reference/core-tag.md#let) holds mutable state whose reassignment triggers [reactive updates](../reference/reactivity.md), [`<const>`](../reference/core-tag.md#const) computes a derived value whenever its dependencies change, and [`static const`](../reference/language.md#static) evaluates once at module load for values that never vary across instances.

## Mutable State

`<let>` declares state written directly, typically from event handlers. Assigning to its [tag variable](../reference/language.md#tag-variables) updates every expression that reads it:

```marko
<let/tipPercent=20>

<button onClick() { tipPercent = 18 }>18%</button>
<button onClick() { tipPercent = 22 }>22%</button>

<output>Tip: ${tipPercent}%</output>
```

Clicking a button reassigns `tipPercent`, updating only the `<output>` text.

The `value=` attribute sets only the _initial_ value. Afterward, an uncontrolled `<let>` changes solely through assignment (or a [`valueChange` handler](../reference/core-tag.md#controllable-let)), even if the initializing expression updates.

## Derived Values

`<const>` computes a value from other reactive variables. It cannot be reassigned and recomputes automatically whenever its dependencies change:

```marko
<let/bill=64>
<let/tipPercent=20>
<const/tip=bill * (tipPercent / 100)>

<button onClick() { tipPercent += 1 }>Round up</button>

<output>Tip: $${tip.toFixed(2)}</output>
```

`tip` always stays in sync with `bill` and `tipPercent` from a single declaration.

> [!WARNING]
> Mirroring a derivation into a `<let>` and updating it manually is an anti-pattern:
>
> ```marko
> <let/bill=64>
> <let/tipPercent=20>
> <let/tip=bill * (tipPercent / 100)>
>
> <button onClick() {
>   tipPercent += 1;
>   tip = bill * (tipPercent / 100); // ❌ repeated in every handler
> }>Round up</button>
> ```
>
> Every handler touching `bill` or `tipPercent` would have to recompute `tip` or leave it stale.

Because updates are batched, a derived `<const>` read inside an event handler reflects the previous state until the queue flushes. See [Stale Derived Values](../reference/reactivity.md#stale-derived-values).

## Module Constants

Statements prefixed with [`static`](../reference/language.md#static) execute in module scope once per environment when the template loads, shared across every instance and request:

```marko
static const currencyFormat = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

<let/bill=64>
<let/tipPercent=20>
<const/total=bill * (1 + tipPercent / 100)>

<output>${currencyFormat.format(total)}</output>
```

`currencyFormat` is constructed once regardless of how many components render, making `static const` ideal for formatters, lookup tables, configuration, and helper functions. Static statements sit outside the reactive system; anything reading `input` or a tag variable belongs in `<const>` or `<let>`.

> [!NOTE]
> Even a value that never changes after mount must use `<const>` if it reads `input` or a tag variable, so it initializes per instance.

## Choosing

Choose the narrowest declaration that fits the value:

- Reassigned by handlers or mutable over time: `<let>`
- Computed from `input` or other reactive values: `<const>`
- Shared identically across every instance: `static const`

Beyond clarity, [targeted compilation](./targeted-compilation.md) generates browser update code only for values that can change, so narrower declarations produce less client work.
