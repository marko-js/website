# Class to Tags API

> [!TLDR]
>
> - Component boundaries carry no state or lifecycle overhead; state lives locally
> - `class`, `state`, `out`, `component`, and instance methods have been removed
> - `input.renderBody` is replaced by `input.content`
> - Event handlers are standard function attributes rather than string-named methods

Marko 4 and 5 used a [Class API](https://v5.markojs.com/docs/class-components/) where each component file managed its own class, `state`, and lifecycle methods. Marko 6 replaces this with the Tags API, where state, reactivity, and side effects are declared inline as tags and analyzed at compile time.

## Components Melt Away

In the Class API, state and lifecycle attach to component boundaries (`state`, `onInput`, `onMount`, `onDestroy`). In the Tags API, component boundaries serve code organization only: state lives locally in [tag variables](../reference/language.md#tag-variables) anywhere in the template (including inside conditionals and loops), and side effects attach to individual tags.

Instance-lookup patterns like `getComponent` have been removed in favor of declarative data flow and [exposed return values](#component-refs).

## Updated APIs

Every removed Class API feature maps to a direct Tags API equivalent:

- `out` is replaced by [`$global`](../reference/language.md#global) for render-scoped globals
- [`class`](https://v5.markojs.com/docs/class-components/#single-file-components), [`state`](https://v5.markojs.com/docs/state/#state), and [`component`](https://v5.markojs.com/docs/class-components/#component) are replaced by [tag variables](../reference/language.md#tag-variables)
- [`input.renderBody`](https://v5.markojs.com/docs/body-content/) is renamed to [`input.content`](../reference/language.md#tag-content)
- [Instance methods](https://v5.markojs.com/docs/class-components/#methods) map to declarative equivalents: [`getEl`/`getEls`](#element-refs) → native tag variables, [`getComponent`](#component-refs) → `<return>`, `forceUpdate` → reassigning [`<let>`](../reference/core-tag.md#let), `subscribeTo` → [`<script>`](../reference/core-tag.md#script) with [`$signal`](../reference/language.md#signal)
- Update directives ([`:scoped`](https://v5.markojs.com/docs/class-components/#scoped), [`:no-update`](https://v5.markojs.com/docs/class-components/#no-update_1), [`no-update`](https://v5.markojs.com/docs/class-components/#no-update), [`no-update-if`](https://v5.markojs.com/docs/class-components/#no-update-if), [`no-update-body`](https://v5.markojs.com/docs/class-components/#no-update-body), [`no-update-body-if`](https://v5.markojs.com/docs/class-components/#no-update-body-if)) are no longer necessary because compiled updates are expression-level
- [`replaceState`](https://v5.markojs.com/docs/class-components/#replacestatenewstate) and [`setStateDirty`](https://v5.markojs.com/docs/class-components/#setstatedirtyname-value) are replaced by [immutable `<let>` reassignment](./immutable-state.md)
- [Split components](https://v5.markojs.com/docs/class-components/#split-components) are no longer necessary because [targeted compilation](./targeted-compilation.md) splits static and interactive code automatically at the sub-template level

## Event Handling

Attribute arguments such as `onClick("handleClick")` have been removed. Event handlers are standard function attributes written inline or passed by reference:

```marko
<let/color="blue">
<button onClick() { color = "red" }>Red</button>

<const/yellowOrGreen() {
  color = Math.random() > 0.5 ? "yellow" : "green";
}>
<button onClick=yellowOrGreen>Random</button>
```

Because [event handlers](../reference/native-tag.md#event-handlers) are plain functions, they can be [spread](../reference/language.md#spread-attributes), wrapped, and called directly, replacing [`this.emit`](https://v5.markojs.com/docs/events/#emitting-custom-events):

```marko
export interface Input extends Marko.HTML.Button {}

<button ...input/>

<button
  ...input
  onClick(e, el) {
    console.log("clicked the second button");
    input.onClick?.(e, el);
  }
/>
```

Pass values back to a parent through standard function parameters:

```marko
export interface Input {
  onClick?: (i: number) => void;
}

<for|i| until=5>
  <button onClick() { input.onClick?.(i) }>${i}</button>
</for>
```

## Element Refs

Instead of [`getEl`](https://v5.markojs.com/docs/class-components/#getelkey-index), native tags expose a [tag variable getter](../reference/native-tag.md#element-references) for the DOM element, readable from [`<script>`](../reference/core-tag.md#script), [`<lifecycle>`](../reference/core-tag.md#lifecycle), and [event handlers](../reference/native-tag.md#event-handlers):

```marko
<input/$el/>

<script>
  $el().focus();
</script>
```

> [!NOTE]
> The leading `$` in `$el` is a naming convention to distinguish element getters from regular state variables.

For multiple elements (replacing [`getEls`](https://v5.markojs.com/docs/class-components/#getelskey)), hoisted tag variables are [iterable](../reference/language.md#repeated-tag-vars):

```marko
<let/focus=0>

<for|i| until=5>
  <input/$el onFocus() { focus = i }>
</for>

<button onClick() {
  const els = [...$el];
  focus = (focus + 1) % els.length;
  els[focus].focus();
}>
  Focus next
</button>
```

## Component Refs

[`getComponent`](https://v5.markojs.com/docs/class-components/#getcomponentkey-index) has been removed. Communicate between parent and child through [function callbacks](#event-handling), the [controllable pattern](./controllable-components.md), or values exposed via [`<return>`](../reference/core-tag.md#return):

```marko
/* parent.marko */
<child/child/>
<child/{ changeColor }/>

<button onClick() {
  child.changeColor("blue");
  changeColor("green");
}>
  Change colors
</button>
```

```marko
/* tags/child.marko */
<let/color="red">
<button style={ "background-color": color }>${color}</button>

<return={
  changeColor(next: string) {
    color = next;
  },
}/>
```

## Lifecycle Hooks

In the Class API, running mount logic inside a loop required extracting a child component:

```marko
/* index.marko */
<for|i| from=0 to=2>
  <log-value value=i/>
</for>
```

```marko
/* components/log-value.marko */
class {
  onMount() {
    console.log(this.input.value);
  }
}
```

In the Tags API, [`<script>`](../reference/core-tag.md#script) attaches directly inside the loop with no extra component:

```marko
<for|i| until=3>
  <script>
    console.log(i);
  </script>
</for>
```

### `<script>`

[`<script>`](../reference/core-tag.md#script) runs browser side effects after mount and re-runs whenever referenced reactive values change, cleaning up through [`$signal`](../reference/language.md#signal):

```marko
<script>
  window.addEventListener("click", () => {
    console.log("clicked anywhere");
  }, { signal: $signal });
</script>
```

> [!CAUTION]
> Like [React's `useEffect`](https://react.dev/learn/you-might-not-need-an-effect), reserve `<script>` for synchronizing with external side effects; prefer `<const>` and `<let>` for derived values and state.

### `<lifecycle>`

[`<lifecycle>`](../reference/core-tag.md#lifecycle) wraps imperative browser APIs with explicit `onMount`, `onUpdate`, and `onDestroy` hooks sharing a stable `this`:

```marko
client import { AudioPlayer } from "audio-player";

<let/volume=0.8>
<div/playerEl/>

<lifecycle
  volume=volume
  onMount() {
    return { player: new AudioPlayer(playerEl(), { volume: this.volume }) };
  }
  onUpdate() {
    this.player.setVolume(this.volume);
  }
  onDestroy() {
    this.player.dispose();
  }
/>
```

## Derived Values

In the Class API, derived values relied on inline [scriptlets](https://v5.markojs.com/docs/syntax/#inline-javascript) or mutating `input` in [`onInput`](https://v5.markojs.com/docs/class-components/#oninputinput-out) (an anti-pattern):

```marko
export interface Input {
  num: number | string;
}
$ const num = Number(input.num);
<div>${num}</div>
```

```marko
export interface Input {
  num: number | string;
}
class {
  onInput(input) {
    input.num = Number(input.num);
  }
}
<div>${input.num}</div>
```

In the Tags API, compute derived values with [`<const>`](../reference/core-tag.md#const):

```marko
export interface Input {
  num: number | string;
}

<const/num=Number(input.num)>
<div>${num}</div>
```

## Further Reading

- [Controllable Components](./controllable-components.md)
- [Reactivity](../reference/reactivity.md)
- [Fine-Grained Bundling](./fine-grained-bundling.md)
