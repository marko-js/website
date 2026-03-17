# Tags API for Class API Developers

> [!TLDR]
>
> - Component Boundaries are _far_ less meaningful, state lives locally
> - `class`, `state`, `out`, `component`, and other class component-specific APIs have been removed
> - Event handling is function-based instead of event-based

Marko 4 and 5 leveraged a [Class-based API](https://v5.markojs.com/docs/class-components/) for interactivity. Marko 6 is based on a new tags-based syntax, where "everything is a tag". For developers familiar with older versions of Marko this will take some getting used to, but we are confident that the Tags API is cleaner, easier to write & read, and more concise.

This page will discuss some of the differences in mental model between the Class API and the Tags API.

## Components Melt Away

The first idea to get used to when adopting the Tags API is that component boundaries have much less importance than they do in the Class API, and component-level methods no longer exist.

In the Class API, state and lifecycle are maintained at the _component_ level. Each single-file component has its own `state`, `onInput`, `onDestroy`, and other lifecycle methods. The Tags API abandons this idea in favor of granular, compiled reactivity. State is declared with [tag variables](../reference/language.md#tag-variables) where necessary, including inside conditionals and loops, and lifecycle is attached to individual tags.

Patterns that depend on the component instance like `getComponent` have been removed and are replaced with [local, declarative alternatives](#component-refs).

## Updated APIs

A quick reference for removed features and their modern equivalents:

- `out` is no longer accessible, except `out.global` as [`$global`](../reference/language.md#global)
- [`class`](https://v5.markojs.com/docs/class-components/#single-file-components), [`state`](https://v5.markojs.com/docs/state/#state), and [`component`](https://v5.markojs.com/docs/class-components/#component) are removed in favor of [tag variables](../reference/language.md#tag-variables)
- All [instance methods](https://v5.markojs.com/docs/class-components/#methods) have been removed
  - [`getEl`/`getEls`](#element-refs), [`getComponent`](#component-refs), `forceUpdate`, `subscribeTo`, etc.
- Directives are no longer necessary, as updates are more granular
  - [`:scoped`](https://v5.markojs.com/docs/class-components/#scoped), [`:no-update`](https://v5.markojs.com/docs/class-components/#no-update_1), [`no-update`](https://v5.markojs.com/docs/class-components/#no-update), [`no-update-if`](https://v5.markojs.com/docs/class-components/#no-update-if), [`no-update-body`](https://v5.markojs.com/docs/class-components/#no-update-body), [`no-update-body-if`](https://v5.markojs.com/docs/class-components/#no-update-body-if)
- Mutable updates via [`replaceState`](https://v5.markojs.com/docs/class-components/#replacestatenewstate) and [`setStateDirty`](https://v5.markojs.com/docs/class-components/#setstatedirtyname-value) were always anti-patterns and have been removed intentionally with no modern alternative
- [Split components](https://v5.markojs.com/docs/class-components/#split-components) are no longer necessary, as [targeted compilation](./targeted-compilation.md) happens at the sub-component level

## Event Handling

Attribute arguments like `onClick("handleClick")` have been removed. Event handlers are normal attributes now, and can be used either inline or by referencing a function:

```marko
<let/color="blue">
<button onClick() { color = "red" }>Red</button>

<const/yellowOrGreen() {
  color = Math.random() > 0.5 ? "yellow" : "green";
}>
<button onClick=yellowOrGreen>Random</button>
```

This _drastically_ simplifies custom tag communication, as function-based [event handlers](../reference/native-tag#event-handlers) can be passed and called directly instead of curried as events. This means they're [spreadable](../reference/language.md#spread-attributes), and [`this.emit`](https://v5.markojs.com/docs/events/#emitting-custom-events) is no longer necessary.

```marko
/* two-buttons.marko */
export interface Input extends Marko.HTML.Button {}

// `onClick` and other event handlers are passed through!
<button ...input/>

<button ...input onClick(e, el) {
  console.log("clicked the second button");

  // call the parent `onClick` after doing something custom
  input.onClick && input.onClick(e, el);
}/>
```

Information is passed to the parent via standard function parameters.

```marko
export interface Input {
  onClick?: (i: number) => void;
}

<for|i| until=5>
  <button onClick() { input.onClick?.(i) }>${i}</button>
</for>
```

## Element Refs

Instead of [`getEl`](https://v5.markojs.com/docs/class-components/#getelkey-index), native tags [expose a tag variable](../reference/native-tag.md#element-references) with a getter to the DOM node. Since it is a function it can be used anywhere in the template.

```marko
<input/$el/>

<script>$el().focus()</script>
```

> [!NOTE]
> We use `$el` by convention. The leading `$` is not necessarily required, but optimizations _may_ be added that only apply if the convention is followed.

When references for multiple elements are required (like [`getEls`](https://v5.markojs.com/docs/class-components/#getelskey) in Marko 5), hoisted tag variables can be [iterated](../reference/language.md#repeated-tag-vars).

```marko
<let/focus=0>

<for|i| until=5>
  <input/$el onFocus() { focus = i }>
</for>

<button onClick() {
  const els = [...$el];
  focus = (focus + 1) % els.length;
  els[focus].focus();
}>Focus next</button>
```

## Component Refs

Since component-level operations no longer exist in the Tags API, [`getComponent`](https://v5.markojs.com/docs/class-components/#getcomponentkey-index) has been removed. Information should be passed between parent and child using [event handlers](#event-handling), the [controllable pattern](./controllable-components.md), and methods exposed by [the `<return>` tag](../reference/core-tag.md#return).

```marko
/* parent.marko */
<child/child>
<child/{ changeColor }>

<button onClick() {
  child.changeColor("blue");
  changeColor("green");
}>Change colors</button>
```

```marko
/* child.marko */
<let/color="red">
<button style={ "background-color": color }>${color}</button>

<return/{ changeColor(c) { color = c } }>
```

## Lifecycle

In the Class API, running code when something mounts inside a loop requires a child component.

```marko
// use class
<for|i| until=3>
  <log-value value=i/>
</for>
```

```marko
/* components/log-value.marko */
// use class
class {
  onMount() { console.log(this.input.value) }
}
```

In the Tags API, no component boundary is required.

```marko
<for|i| until=3>
  <script>console.log(i)</script>
</for>
```

The Tags API has two built-in tags for lifecycle management, both of which _should be avoided unless absolutely necessary_.

### `<script>`

The [`<script>` tag](../reference/core-tag.md#script) is used in the Tags API to execute user effects.

```marko
<script>
  window.addEventListener("click", () => {
    console.log("clicked anywhere");
  }, { signal: $signal });
</script>
```

> [!CAUTION]
> The `<script>` tag is Marko's equivalent to [React's `useEffect`](https://react.dev/reference/react/useEffect), and as such it [should be avoided](https://react.dev/learn/you-might-not-need-an-effect) unless side effects are required.

### `<lifecycle>`

The [`<lifecycle>` tag](../reference/core-tag.md#lifecycle) is for escaping the reactive system to work with imperative APIs (maps, charts, etc.). Each `<lifecycle>` tag manages its own `onMount`, `onUpdate`, and `onDestroy`, and `this` is stable across the tag's lifetime.

This tag should be used sparingly, usually `<script>` or regular state via `<let>`/`<const>` is a better option.

```marko
<let/latitude=0>
<let/longitude=0>

<lifecycle
  onMount() {
    this.map = new WorldMap($el());
    this.map.on("move", () => {
      latitude = this.map.x;
      longitude = this.map.y;
    });
  }
  onUpdate() {
    this.map.setCoords(latitude, longitude);
  }
  onDestroy() { this.map.destroy() }
>

<div/$el/>
```

## Derived values

In the Class API, there are multiple ways to derive values.

1. Inline JS [scriptlets](https://v5.markojs.com/docs/syntax/#inline-javascript) with `const`

    ```marko
    export interface Input {
      num: number | string;
    }
    $ const num = parseInt(input.num);
    <div>${num}</div>
    ```

2. Some Class API applications use [`onInput`](https://v5.markojs.com/docs/class-components/#oninputinput-out) to validate or transform values. This is an anti-pattern and can lead to issues, but is still fairly common.

    ```marko
    export interface Input {
      num: number | string;
    }
    class {
      onInput(input) {
        input.num = parseInt(input.num);
      }
    }
    <div>${input.num}</div>
    ```

In the Tags API, all derivations should happen through the `<const>` tag.

```marko
export interface Input {
  num: number | string;
}
<const/num=parseInt(input.num)>
<div>${num}</div>
```

## Further Reading

- [Controllable Components](./controllable-components.md)
- [Reactivity](../reference/reactivity.md)
- [Fine-Grained Bundling](./fine-grained-bundling.md)
