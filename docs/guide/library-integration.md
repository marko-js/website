# Library Integration

Third-party UI often arrives as an imperative JavaScript API rather than markup. Marko integrates those libraries through declarative tags so mount, update, and teardown stay aligned with the reactive tree.

## Framework-Agnostic Libraries

Prefer the [`<lifecycle>`](../reference/core-tag.md#lifecycle) tag when a library needs create, update, and destroy hooks. `this` is stable across the three handlers; return an object from `onMount` to stash instances for later use.

```marko
client import { MapView } from "map-view";

export interface Input {
  lat: number;
  lng: number;
}

<div/container/>
<lifecycle
  onMount() {
    return {
      map: new MapView(container(), {
        center: [input.lat, input.lng],
      }),
    };
  }
  onUpdate() {
    this.map.setCenter([input.lat, input.lng]);
  }
  onDestroy() {
    this.map.destroy();
  }
/>
```

`onUpdate` re-runs when reactive values it reads change (`input.lat` and `input.lng` above). Import browser-only packages with [`client import`](../reference/language.md#server-and-client) so they are not required on the server.

> [!WARNING]
> Do not wire the same mount and cleanup flow by hand with a single [`<script>`](../reference/core-tag.md#script) if the library has distinct update and destroy steps. `<lifecycle>` keeps `this` and teardown in one place. Reserve `<script>` for lighter reactive effects that use [`$signal`](../reference/language.md#signal) for cleanup.

```marko
<div/el/>
<script>
  el().focus();
</script>
```

## Marko Libraries

Packages that ship `.marko` tags are discovered like any other [installed custom tags](../reference/custom-tag.md#installed-custom-tags). After installing the package, use the tag name from its `marko.json` (or the tag files it publishes) without a manual import when discovery can find it.

```marko
// after: npm install @example/date-picker
<example-date-picker value:=selected/>
```

When a package exports a tag path instead of auto-discovery metadata, import it as a [local variable tag](../reference/custom-tag.md#local-variable-custom-tags):

```marko
import DatePicker from "@example/date-picker/date-picker.marko"

<DatePicker value:=selected/>
```

Publish guidance for authoring such packages lives under [Publishing Components](./publishing-components.md).

## Web Components

### Consuming in Marko

Custom elements are normal HTML tags in Marko. Attributes and properties follow the same rules as [native tags](../reference/native-tag.md): use event handler attributes for DOM events, and prefer controlled patterns when the element exposes a value the template owns.

```marko
<let/open=false>

<my-drawer open=open onOpenChange(e) { open = e.detail }>
  Drawer body
</my-drawer>
```

If the element only documents a JavaScript property API, set that up in a [`<lifecycle>`](#framework-agnostic-libraries) once a ref is available, the same as any other imperative widget.

### Using Marko in a Web Component

Mount a Marko template into an element with the [template API](../reference/template.md#templatemountinput-node-position):

```js
import template from "./widget.marko";

class MarkoWidget extends HTMLElement {
  connectedCallback() {
    this._mounted = template.mount(
      { label: this.getAttribute("label") },
      this,
    );
  }
  disconnectedCallback() {
    this._mounted?.destroy();
  }
}

customElements.define("marko-widget", MarkoWidget);
```

Call [`destroy()`](../reference/template.md#render-result) on disconnect so `$signal` and lifecycle cleanup run.

### Wrapping Imperative APIs

When a library should look like a Marko tag to the rest of the app, wrap it once:

1. Put the widget in a custom tag under `tags/`.
2. Own DOM nodes with [tag variables](../reference/language.md#tag-variables) (`<div/root>`).
3. Drive the library through `<lifecycle>`.
4. Expose Marko-friendly attributes and change handlers so parents can use `value:=` and ordinary events.

That keeps imperative detail out of pages and leaves the compiler free to [tree-shake](../explanation/fine-grained-bundling.md) unused interactivity.

## Further Reading

- [`<lifecycle>`](../reference/core-tag.md#lifecycle)
- [`<script>`](../reference/core-tag.md#script)
- [Lazy Loading](../reference/lazy-loading.md) for deferring heavy widgets
