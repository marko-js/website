# `<let>` vs `<const>` vs `static`

> [!TLDR]
>
> - [`<let>`](../reference/core-tag.md#let): mutable reactive state
> - [`<const>`](../reference/core-tag.md#const): derived value, pure, recomputes with dependencies
> - [`static const`](../reference/language.md#static): module-level constant, initialized once, not reactive

In JavaScript, `let` and `const` differ only in whether a binding may be reassigned. Marko borrows both keywords, as the [`<let>`](../reference/core-tag.md#let) and [`<const>`](../reference/core-tag.md#const) tags and the [`static`](../reference/language.md#static) statement prefix, and gives each a distinct role in the [reactive system](../reference/reactivity.md). The choice comes down to one question: when should this value change, and what should change with it?

## Mutable State

The `<let>` tag declares state written directly, typically from event handlers. Assigning to its [tag variable](../reference/language.md#tag-variables) updates every expression that reads it.

```marko
<let/tipPercent=20>

<button onClick() { tipPercent = 18 }>18%</button>
<button onClick() { tipPercent = 22 }>22%</button>

<output>Tip: ${tipPercent}%</output>
```

Clicking a button reassigns `tipPercent`, and the `<output>` text updates to match. Nothing else re-renders.

The `value=` attribute is only an _initial_ value. Once created, the state changes solely through assignment (or a [`valueChange` handler](../reference/core-tag.md#controllable-let)), even if the initializing expression later changes.

## Derived Values

The `<const>` tag declares a value computed from other reactive variables. It cannot be assigned; it recomputes whenever anything it reads changes.

```marko
<let/bill=64>
<let/tipPercent=20>
<const/tip=bill * (tipPercent / 100)>

<button onClick() { tipPercent += 1 }>Round up</button>

<output>Tip: $${tip.toFixed(2)}</output>
```

Here `tip` always reflects the current `bill` and `tipPercent`. No handler keeps it in sync; the relationship is declared once.

> [!WARNING]
> Mirroring a derivation into a `<let>` and updating it by hand is an anti-pattern:
>
> ```marko
> <let/bill=64>
> <let/tipPercent=20>
> <let/tip=bill * (tipPercent / 100)>
>
> <button onClick() {
>   tipPercent += 1;
>   tip = bill * (tipPercent / 100); // ❌ BAD: repeated in every handler
> }>Round up</button>
> ```
>
> Every code path touching `bill` or `tipPercent` must now also recompute `tip`, and forgetting one shows a stale total. A `<const>` states the formula once.

Because updates are batched, a derived value read inside an event handler still holds the result computed from the previous state. See [Stale Derived Values](../reference/reactivity.md#stale-derived-values).

## Module Constants

Statements prefixed with [`static`](../reference/language.md#static) run in module scope, once per environment when the template loads. A `static const` is shared by every instance, across every render and request.

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

The `Intl.NumberFormat` instance is built a single time, however many components render. That makes `static const` the right home for formatters, configuration, lookup tables, and helper functions.

Static statements are evaluated [only once](../reference/reactivity.md#render-expressions), outside the reactive system. Anything that varies per instance or over time belongs in `<const>` or `<let>`.

> [!NOTE]
> A value that reads `input` or any tag variable must be a `<const>`, even if it never appears to change; only a `<const>` is initialized per instance and tracked.

## Choosing

Prefer the most fixed declaration that still describes the value:

- Assigned by handlers or otherwise changes on its own: `<let>`
- Computed from `input`, tag variables, or other reactive state: `<const>`
- Identical for every instance and never changes: `static const`

This is not only a style choice: the compiler [generates update code](./targeted-compilation.md) only for what can actually change, so the more fixed forms produce less work in the browser.
