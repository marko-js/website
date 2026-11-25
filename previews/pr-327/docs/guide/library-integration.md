# Library Integration

Marko integrates with imperative JavaScript libraries and Web Components through [`<lifecycle>`](../reference/core-tag.md#lifecycle), element references, `marko.json` tag registration, and [`Template.mount`](../reference/template.md#templatemountinput-node-position).

## Imperative Libraries

Use [`<lifecycle>`](../reference/core-tag.md#lifecycle) with a `client import` and a native element reference to initialize, update, and tear down third-party DOM widgets:

```marko
client import { createChart } from "chart-lib";

export interface Input {
  points: number[];
}

<canvas/canvas/>

<lifecycle
  points=input.points
  onMount() {
    return { chart: createChart(canvas(), this.points) };
  }
  onUpdate() {
    this.chart.setData(this.points);
  }
  onDestroy() {
    this.chart.destroy();
  }
/>
```

Any reactive value read in the `<lifecycle>` attributes triggers `onUpdate` automatically, while `onMount` and `onDestroy` run once when the template mounts and unmounts in the browser.

## Custom Elements

Declare a custom element as an HTML tag in `marko.json` so the compiler emits it verbatim (see [Custom Tags](../reference/custom-tag.md#native-tag-registration) and [TypeScript](../reference/typescript.md#custom-elements)):

```json
{
  "<x-datepicker>": { "html": true }
}
```

Marko writes attributes on registered custom elements with `setAttribute`, never as JavaScript properties. When a custom element exposes a property-only API (such as complex object inputs), set it through an element reference inside [`<script>`](../reference/core-tag.md#script):

```marko
<x-datepicker/picker/>

<script>
  picker().disabledDates = input.holidays;
</script>
```

For non-lowercase custom events, attach listeners with the `on-` prefix (`on-dateSelected`) so event name casing is preserved.

## Mounting Marko

To embed a Marko template inside a non-Marko application or custom element, mount it into a light DOM `Element` with [`Template.mount`](../reference/template.md#templatemountinput-node-position):

```js
import Widget from "./widget.marko";

const instance = Widget.mount({ count: 1 }, containerElement);
instance.update({ count: 2 });
instance.destroy();
```

> [!NOTE]
> `Template.mount` requires an HTML `Element` in the light DOM. Marko delegates events on `document` and inherits the parent element's HTML namespace, so mounting inside a `ShadowRoot` or `DocumentFragment` is not supported.
