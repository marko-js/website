# Reactivity Reference

Marko's goal is to make it easy to represent performant experiences with rich client interactions. This is enabled through its **reactivity system**. The reactive system is how Marko determines what needs to update and when.

The core of Marko's reactive system is [the `<let>` tag](./core-tag.md#let).

## Reactive Variables

In Marko, [Tag Variables](./language.md#tag-variables), [Tag Parameters](./language.md#tag-parameters), and [`input`](./language.md#input) are all reactive. This means they are tracked by the Marko compiler and when these values are caused to update any dependent [render expressions](#render-expressions) are also updated.

## Render Expressions

Any expression within a `.marko` template that references a [reactive variable](#reactive-variables) is considered reactive and will be updated alongside that variable.

These reactive expressions may exist throughout the template in [attributes](./language.md#attributes), [dynamic text](./language.md#dynamic-text), [dynamic tag names](./language.md#dynamic-tags), and [script content](./core-tag.md#script).

> [!NOTE]
> All JavaScript expressions within the Marko template may be reactive with the exception of
> [static statements](./language.md#static) (including [`import`](./language.md#import), [`export`](./language.md#export), [`static`](./language.md#static), [`server` and `client`](./language.md#server-and-client)) which are evaluated _once_ when the template is loaded.

```marko
<let/count=0>

<button onClick() { count++ }>
  Current: ${count}
</button>
```

Here, a `count` Tag Variable is mutated by a button click. Because the text content of the button references `count`, it is automatically kept in sync with the new value.

> [!CAUTION]
> In some cases Marko may cause some expressions to evaluate together. This is why [render expressions](#render-expressions) should be pure: no network calls, no writes to other state, no reliance on call order beyond reading reactive values.

<!---->

> [!TIP]
> Marko is a **compiled language**, and its reactive graph is discovered at compile time instead of during runtime. This is in contrast with many of the other leading approaches, such as [Signals in SolidJS](https://docs.solidjs.com/advanced-concepts/fine-grained-reactivity) and [Hooks in React](https://react.dev/reference/react/hooks).

## Derived Values

Use [`<const>`](./core-tag.md#const) for values that can be computed from other reactive data. The const recomputes when its dependencies change. Prefer this over an effect that writes back into a `<let>`.

```marko
<let/items=[]>
<const/remaining=items.filter((item) => !item.done).length>

<p>${remaining} left</p>
```

See [let vs const vs static](../explanation/let-vs-const.md) for when each declaration fits.

## Immutable Updates

Marko detects changes when a reactive variable is **reassigned**. Mutating an object or array in place does not schedule an update.

```marko
<let/items=["a", "b"]>

<button onClick() {
  // ❌ no UI update: same array reference
  items.push("c");

  // ✅ new value, dependents re-run
  items = items.concat("c");
}>Add</button>
```

The same rule applies to objects: replace with a new object (`user = { ...user, name }`) rather than assigning `user.name = ...` alone. More detail lives in [Immutable State](../explanation/immutable-state.md).

## Scheduling Updates

Marko automatically batches work to ensure optimal performance. Any time a [reactive variable](#reactive-variables) is changed, its update is queued to ensure that multiple changes will be applied efficiently together.

This update queue is typically scheduled after a [microtask](https://developer.mozilla.org/en-US/docs/Web/API/HTML_DOM_API/Microtask_guide).

If additional updates are scheduled after the queue is consumed but _before the update is painted_, they are deferred until the next frame. This accomplishes a few things:

- Content ready to display to the user is not blocked.
- It is not possible to lock up the application in an infinite update loop.
- The update loop can be used to power animations (although CSS [Animations](https://developer.mozilla.org/en-US/docs/Web/CSS/animation) & [Transitions](https://developer.mozilla.org/en-US/docs/Web/CSS/transition)/ JS [Web Animations API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API) are preferred in most cases).

## Effects and Cleanup

Most UI should be declarative state and markup. When browser-only side effects are required, use [`<script>`](./core-tag.md#script) for reactive effects or [`<lifecycle>`](./core-tag.md#lifecycle) for imperative libraries with mount, update, and destroy hooks.

Cleanup runs through [`$signal`](./language.md#signal), an `AbortSignal` aborted when the effect re-runs or the content is removed.

```marko
<script>
  const id = setInterval(() => {
    console.log("tick");
  }, 1000);
  $signal.onabort = () => clearInterval(id);
</script>
```

## Resume

After [server rendering](../explanation/streaming.md), the client does not re-run the full template to rebuild the page. It deserializes the state that was written into the HTML, attaches to existing DOM, and only runs update logic when reactive values change later. That handoff is [resumability](../explanation/why-is-marko-fast.md#resumability). Values that must cross the boundary have to be [serializable](../explanation/serializable-state.md).

## Further Reading

- [Let vs Const](../explanation/let-vs-const.md)
- [Immutable State](../explanation/immutable-state.md)
- [Nested Reactivity](../explanation/nested-reactivity.md)
- [Controllable Components](../explanation/controllable-components.md)
- [Optimizing Performance](../explanation/optimizing-performance.md)
