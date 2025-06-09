# Reactivity Reference

Marko's goal is to make it easy to represent performant experiences with rich client interactions. This is enabled through its **reactivity system**. The reactive system is how Marko determines what needs to update and when.

The core of Marko's reactive system is [the `<let>` tag](./core-tag.md#let).

## Reactive Variables

In Marko, [Tag Variables](./language.md#tag-variables), [Tag Parameters](./language.md#tag-parameters), and [`input`](./language.md#input) are all reactive. This means they are tracked by the Marko compiler and when these values are caused to update any dependent [render expressions](#render-expressions) are also updated.

## Render Expressions

Any expression within a `.marko` template that references a [reactive variable](#reactive-variables) is considered reactive and will be updated alongside that variable.

These reactive expressions may exist throughout the template in [attributes](./language.md#attributes), [dynamic text](./language.md#dynamic-text), [dynamic tag names](./language.md#dynamic-tags), and [script content](./core-tag.md#script).

> [!NOTE]
> All JavaScript expressions withing the Marko template may be reactive with the exception of
> [static statements](./language.md#static) (including [`import`](./language.md#import), [`export`](./language.md#export), [`static`](./language.md#static), [`server` and `client`](./language.md#server-and-client)) which are evaluated _once_ when the template is loaded.

```marko
<let/count=0>

<button onClick() { count++ }>
  Current: ${count}
</button>
```

Here, a `count` Tag Variable is mutated by a button click. Because the text content of the button references `count`, it is automatically be kept in sync with the new value.

> [!CAUTION]
> In some cases Marko may cause some expressions to evaluate together. This is why [render expressions](#render-expressions) should be pure.

<!--  -->

> [!TIP]
> Marko is a **compiled language**, and its reactive graph is discovered at compile time instead of during runtime. This is in contrast with many of the other leading approaches, such as [Signals in SolidJS](https://docs.solidjs.com/advanced-concepts/fine-grained-reactivity) and [Hooks in React](https://react.dev/reference/react/hooks).

## Scheduling Updates

Marko automatically batches work to ensure optimal performance. Any time a [reactive variable](#reactive-variables) is changed, its update is queued to ensure that multiple changes will be applied efficiently together.

This update queue is typically scheduled after a [microtask](https://developer.mozilla.org/en-US/docs/Web/API/HTML_DOM_API/Microtask_guide).

If additional updates are scheduled after the queue is consumed but _before the update is painted_, they are deferred until the next frame. This accomplishes a few things:

- Content ready to display to the user is not blocked.
- It is not possible to lock up the application in an infinite update loop.
- The update loop can be used to power animations (although CSS [Animations](https://developer.mozilla.org/en-US/docs/Web/CSS/animation) & [Transitions](https://developer.mozilla.org/en-US/docs/Web/CSS/transition)/ JS [Web Animations API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API) are preferred in most cases).
