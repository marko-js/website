# Reactivity Reference

Marko's reactivity system tracks dependencies between state and DOM output at compile time, updating only the affected nodes when values change. Mutable state starts with [`<let>`](./core-tag.md#let).

## Reactive Variables

[Tag variables](./language.md#tag-variables), [tag parameters](./language.md#tag-parameters), and [`input`](./language.md#input) are reactive. Writable state comes from `<let>` and assignable [`<return>`](./core-tag.md#assignable-return-value) tags; other tag variables (`<const>`, `<id>`, `<define>`, element references) are derived or read-only. [`$global`](./language.md#global) is not reactive.

## Render Expressions

Any expression in a template that reads a [reactive variable](#reactive-variables) re-evaluates when that variable changes. Reactive expressions appear in [attributes](./language.md#attributes), [tag arguments](./language.md#tag-arguments), [dynamic text](./language.md#dynamic-text), [dynamic tag names](./language.md#dynamic-tags), [`<style>` dynamic values](./core-tag.md#dynamic-values), [`<html-comment>`](./core-tag.md#html-comment), and [`<script>`](./core-tag.md#script) bodies.

> [!NOTE]
> Module-level [statements](./language.md#statements) (`import`, `export`, `static`, `server`, and `client`) run once when the template module loads and are outside the reactive graph.

```marko
<let/count=0>

<button onClick() { count++ }>
  Current: ${count}
</button>
```

Clicking the button reassigns `count`, and the button text updates automatically.

> [!CAUTION]
> The compiler may group or reorder render expressions into shared update functions, so render expressions must be pure.

<!---->

> [!TIP]
> Marko resolves its reactive dependency graph at compile time rather than tracking subscriptions at runtime, generating direct DOM updates for each state variable.

## Scheduling Updates

Marko compares updates by reference equality (`===`) and batches changes into an update queue flushed on the next [microtask](https://developer.mozilla.org/en-US/docs/Web/API/HTML_DOM_API/Microtask_guide).

Updates scheduled after the microtask flush but before the browser paints are deferred to the next animation frame. This ensures:

- Content ready to paint is not blocked
- Reactive feedback loops are throttled to at most one cycle per frame
- Updates in background tabs pause until the document is visible

For visual motion, prefer CSS [Animations](https://developer.mozilla.org/en-US/docs/Web/CSS/animation), CSS [Transitions](https://developer.mozilla.org/en-US/docs/Web/CSS/transition), or the [Web Animations API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API).

### Stale Derived Values

Assigning to an uncontrolled [`<let>`](./core-tag.md#let) writes the new value into scope immediately, so subsequent lines in the same handler read the updated value. (A [controllable `<let>`](./core-tag.md#controllable-let) invokes its `valueChange` handler instead, updating only when the owner updates and flushes.) Derived values such as [`<const>`](./core-tag.md#const) and rendered DOM nodes recompute when the queue flushes, so they still hold the previous state for the rest of the handler:

```marko
<let/quantity=1>
<const/subtotal=quantity * input.unitPrice>

<button onClick() {
  quantity++;

  // ❌ `subtotal` still holds the previous value until the update queue flushes
  console.log(subtotal);

  // ✅ `quantity` holds the new value; compute the total from it directly
  input.onQuantityChange(quantity, quantity * input.unitPrice);
}>
  Add one
</button>

<output>${subtotal}</output>
```

> [!WARNING]
> Reading `subtotal` or the DOM inside the handler after `quantity++` returns the value from the previous render because the update queue has not flushed yet.
