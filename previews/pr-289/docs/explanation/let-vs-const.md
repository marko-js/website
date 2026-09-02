# `<let>` vs `<const>` vs `static`

> [!TLDR]
>
> - [`<let>`](../reference/core-tag.md#let): mutable reactive state
> - [`<const>`](../reference/core-tag.md#const): derived value, pure, recomputes with dependencies
> - [`static const`](../reference/language.md#static): module-level constant, initialized once, not reactive

In JavaScript, `let` and `const` differ only in whether a binding may be reassigned. Marko borrows both keywords, as the [`<let>`](../reference/core-tag.md#let) and [`<const>`](../reference/core-tag.md#const) tags and the [`static`](../reference/language.md#static) statement prefix, and gives each a distinct role in the [reactive system](../reference/reactivity.md). Picking between them is less about mutability and more about answering one question: when should this value change, and what should change with it?

## Mutable State

The `<let>` tag declares state that is written directly, typically from event handlers. Assigning to its [tag variable](../reference/language.md#tag-variables) queues an update for every expression that reads it.

```marko
<let/tipPercent=20>

<button onClick() { tipPercent = 18 }>18%</button>
<button onClick() { tipPercent = 22 }>22%</button>

<output>Tip: ${tipPercent}%</output>
```

Clicking a button reassigns `tipPercent`, and the `<output>` text updates to match. Nothing else re-renders; only expressions that read the variable are affected.

The `value=` attribute of `<let>` is an _initial_ value. Once the state exists, it changes only through assignment (or a [`valueChange` handler](../reference/core-tag.md#controllable-let)), even if the expression it was initialized from later changes. That independence is what makes `<let>` state: it owns its value from then on.

## Derived Values

The `<const>` tag declares a value computed from other reactive variables. It cannot be assigned; instead, it recomputes whenever anything it reads changes.

```marko
<let/bill=64>
<let/tipPercent=20>
<const/tip=bill * (tipPercent / 100)>

<button onClick() { tipPercent += 1 }>Round up</button>

<output>Tip: $${tip.toFixed(2)}</output>
```

Here `tip` always reflects the current `bill` and `tipPercent`. There is no handler responsible for keeping it in sync; the relationship is declared once and holds for the life of the component.

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
> Every code path that touches `bill` or `tipPercent` must now remember to also recompute `tip`, and forgetting one leaves the UI showing a stale total. A `<const>` states the formula once and removes the entire class of bug.

Because updates are batched, a derived value read from inside an event handler still holds the result computed from the previous state. See [Stale Derived Values](../reference/reactivity.md#stale-derived-values) for how to handle values needed immediately after an assignment.

## Module Constants

Statements prefixed with [`static`](../reference/language.md#static) run in module scope, once per environment when the template is first loaded. A `static const` is shared by every instance of the component, across every render and request.

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

The `Intl.NumberFormat` instance is built a single time, no matter how many components render or how often `total` recomputes. This makes `static const` the right home for values that are identical everywhere: formatters, configuration, lookup tables, and helper functions.

Because static statements are evaluated [only once](../reference/reactivity.md#render-expressions), they are outside the reactive system. Anything that varies per instance or over time belongs in `<const>` or `<let>` instead.

> [!NOTE]
> A `<const>` is initialized for each component instance and tracks its dependencies; a `static const` is initialized once for the whole module. A value that reads `input` or any tag variable must be a `<const>`, even if it never appears to change.

## Choosing

The three declarations form a spectrum from most dynamic to most fixed, and the best choice is the most fixed one that still describes the value:

- The value is assigned by handlers or otherwise changes on its own: `<let>`
- The value is computed from `input`, tag variables, or other reactive state: `<const>`
- The value is the same for every instance and never changes: `static const`

Preferring the most fixed form is not only a style choice. The compiler [analyzes the template](./targeted-compilation.md) and generates update code only for what can actually change, so a value declared as `static const` or `<const>` produces less work in the browser than the same value held in a `<let>`.
