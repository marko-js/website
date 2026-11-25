# Native Tags

Native tags are [built-in HTML, SVG, and MathML elements](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements). In Marko they follow standard HTML semantics with targeted ergonomic enhancements.

Attributes on native tags (including [custom elements registered with `"html": true`](./custom-tag.md#native-tag-registration)) are written via `setAttribute`, except for Marko's built-in [controllable bindings](#change-handlers). To assign JavaScript properties directly on a custom element, use an [element reference](#element-references) inside [`<script>`](./core-tag.md#script).

## Element References

Every native tag exposes a [tag variable](./language.md#tag-variables) returning a getter for its DOM node:

```marko
<div/ref/>

<script>
  ref().innerHTML = "Hello World";
</script>
```

> [!CAUTION]
> DOM nodes exist only in the browser, and element getters are readable only in post-render code: [`<script>`](./core-tag.md#script) bodies, [`<lifecycle>`](./core-tag.md#lifecycle) hooks, and [event handlers](#event-handlers). Attributes, [`<const>`](./core-tag.md#const), and [interpolations](./language.md#dynamic-text) evaluate during render.

## Enhanced Attributes

### `class=`

Accepts strings, objects, and arbitrarily nested arrays:

```marko
// string
<div class="a c"/>

// object
<div class={ a: true, b: false, c: true }/>

// array
<div class=["a", null, { c: true }]/>
```

All three render the same HTML:

```html
<div class="a c"></div>
```

Object keys are class names included when their value is truthy (one level deep, never recursively traversed). Array entries may nest and spread, skipping falsy entries. Each class name may appear only once across a `class=` value (except across mutually exclusive ternary branches), because Marko updates individual toggled classes independently.

```marko
<let/query="">

<input
  value:=query
  class=["field", query && ["field-filled", { "field-error": !query.trim() }]]
>
```

### `style=`

Accepts strings, objects, and arbitrarily nested arrays:

```marko
// string
<div style="display:block;margin-right:16px"/>

// object
<div style={ display: "block", "margin-right": "16px" }/>

// array
<div style=["display:block", null, { "margin-right": "16px" }]/>
```

All three render `display:block;margin-right:16px` (joined with `;`, no trailing `;`).

Object keys write verbatim as hyphen-case CSS property names.

> [!WARNING]
> Unlike [the DOM `style` API](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style), keys are not converted from camelCase:
>
> ```marko
> // ❌ renders `backgroundColor:red`
> <div style={ backgroundColor: "red" }/>
>
> // ✅
> <div style={ "background-color": "red" }/>
> ```

Values stringify verbatim with no unit inference (`{ "margin-right": 16 }` renders `margin-right:16`, not `16px`). Use numbers only for unitless properties (`line-height`, `z-index`) or `0`.

A declaration is dropped when its value is `false`, `null`, `undefined`, `""`, `NaN`, or `0n`, matching [skipped dynamic text values](./language.md#skipped-values). `0` is kept (`{ width: 0 }` renders `width:0`).

> [!TIP]
> TypeScript rejects `false` as a style object property value, so place conditional declarations inside an array:
>
> ```marko
> <div style=["display:block", isError && { color: "red" }]/>
> ```

Arrays nest and spread as in [`class=`](#class), and each CSS property may appear only once in a `style=` value. Custom properties (`--foo`) write verbatim and can be typed via [`Marko.CSS.Properties`](./typescript.md#css-properties).

### `content=`

Native elements that accept child markup accept body content via `content=`. The value may be a [`<define>`](./core-tag.md#define) variable, an imported template, an attribute tag carrying content, a falsy value, or the surrounding template's `input.content`.

Because `content` is part of `input`, a [spread](./language.md#spread-attributes) forwards both attributes and children:

```marko
/* tags/field-row.marko */
<fieldset ...input/>
```

```marko
/* signup.marko */
<field-row class="row">
  <label for="email">Email</label>
  <input id="email" name="email" type="email">
</field-row>
```

Pass `content=` explicitly to target an inner wrapper element:

```marko
<section class="card">
  <h2>${input.title}</h2>
  <div class="card-body" content=input.content/>
</section>
```

`content=` is reactive; swapping the value replaces the inner content without recreating the host element:

```marko
<let/expanded=false>
<define/Summary>
  <h2>${input.title}</h2>
</define>
<define/Details>
  <h2>${input.title}</h2>
  <p>${input.description}</p>
</define>

<article content=(expanded ? Details : Summary)/>
<button onClick() { expanded = !expanded }>Toggle</button>
```

> [!WARNING]
> Any literal tag body takes precedence over `content=`, including a body containing only a [comment](./language.md#comments):
>
> ```marko
> <div content=Summary>
>   // ❌ this comment is body content, so `Summary` never renders
> </div>
> ```

Attributes merge left to right: placing `content=` after a spread overrides forwarded content, and `content=undefined` drops forwarded content while keeping all other attributes:

```marko
<div ...input content=undefined/>
```

Void elements (`<img>`, `<input>`, etc.) and raw-text elements (`<textarea>`, `<title>`, `<html-script>`, `<html-style>`) do not accept `content=` as child markup.

> [!NOTE]
> On [`<meta>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/meta), `content` keeps its standard HTML attribute meaning, including through spreads:
>
> ```marko
> <let/height=630>
> <meta property="og:image:height" content=height>
> ```

See [Typing `content`](./typescript.md#typing-content) for TypeScript types.

### Event Handlers

Attributes beginning with `on` followed by `-` or a capital letter register [event listeners](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener). `on-` preserves exact event casing, while `onCamelCase` lowercases the event name (in TypeScript, standard DOM events use exact camelCase spellings such as `onKeyDown`):

- `onDblClick` → `dblclick`
- `on-DblClick` → `DblClick`

```marko
<button onClick() { alert("Hi!") }>Say Hi</button>

// equivalent to
<button on-click() { alert("Hi!") }>Say Hi</button>
```

Values must be a function or a [falsy](https://developer.mozilla.org/en-US/docs/Glossary/Falsy) value, enabling conditional listeners:

```marko
<let/clicked=false>
<button onClick=!clicked && (() => {
  alert("First click!");
  clicked = true;
})>
  Click me!
</button>
```

> [!TIP]
> Use `on-` for [custom elements](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements) that dispatch mixed-case event names.

<!---->

> [!CAUTION]
> Avoid native inline HTML string handlers; they bypass Marko reactivity and conflict with strict [CSP](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP) policies:
>
> ```marko
> <button onclick="this.innerHTML++">0</button>
> ```

#### Handler Arguments

Every event handler receives `(event, target)`: the [`Event`](https://developer.mozilla.org/en-US/docs/Web/API/Event) and the element carrying the `on*` attribute:

```marko
<form onSubmit(event, form) {
  event.preventDefault();
  fetch("/subscribe", { method: "POST", body: new FormData(form) });
}>
  <input name="email" type="email">
  <button>Subscribe</button>
</form>
```

Unlike `event.target` (which may be a clicked descendant element), the second parameter is always the element with the handler attached. Because handlers are [delegated](#delegation) on `document`, use the second argument or an [element reference](#element-references) rather than `event.currentTarget`.

#### Delegation

Marko attaches a single capture-phase listener per event type on `document` and dispatches matching handlers from the event target upward through bubbling ancestors:

- Marko handlers run before listeners attached with `addEventListener` on the element or any descendant of `document`.
- Calling `event.stopPropagation()` inside a Marko handler stops ancestor Marko handlers as well as `addEventListener` listeners below `document` (including on the same element). Calling it in an `addEventListener` listener below `document` does not affect Marko handlers, which have already run.
- Non-bubbling events (`focus`, `blur`, `load`) invoke only the handler on the target element.
- Events inside a Shadow DOM retarget to the host before reaching `document`, so Marko's delegated handlers operate on light DOM trees.

### Enhanced Value Attributes

Marko adds uniform state attributes to native form controls whose DOM state is normally split across child elements or properties.

#### Radio and Checkbox

`<input type="radio">` and `<input type="checkbox">` support `checkedValue=`, marking the input `checked` whenever `checkedValue=` matches `value=`:

- String `checkedValue=`: selects one matching radio input (keep `name=` for native form submission and keyboard navigation).
- String array `checkedValue=`: checks every checkbox whose `value=` is in the array.

#### `<select>`

`<select>` supports `value=` as a string (single select) or string array (`<select multiple>`), setting `selected` on matching `<option>` elements using string comparison (`value=25` matches `<option value="25">`; `null` or `undefined` matches an empty `value=`).

When `<select>` uses `value=` or `valueChange=`, every nested `<option>` (including inside `<optgroup>` or `<for>`) must declare its own `value=`, and initial selection comes from the `<select>` rather than `selected=` on `<option>`.

#### `<textarea>`

`<textarea>` accepts its value through either its body or `value=` (not both). Static `<textarea>` body text decodes HTML character references and re-escapes through the value path.

### Change Handlers

Native controls that maintain internal browser state (`<input>`, `<select>`, `<textarea>`, `<details>`, `<dialog>`) are **uncontrolled** by default: setting `value=` writes only the HTML default attribute while the browser owns edits.

Adding a matching `*Change` attribute makes the control **controlled** by Marko state. Every user edit invokes the handler, and the DOM reflects the bound state:

```marko
// Uncontrolled: browser owns user edits; later `value=` updates do not overwrite them
<input value="hello">

// Controlled with two-way binding (`:=`)
<let/message="hello">
<input value:=message>
<div>${message}</div>
<button onClick() { message = "goodbye" }>Set to goodbye</button>
```

Use an explicit change handler to normalize, validate, or mask input before storing it:

```marko
<let/cardNumber="5555 5555 5555 5555">
<input
  value=cardNumber
  valueChange(v) {
    cardNumber = [...v.replace(/\D/g, "").matchAll(/\d{1,4}/g)].join(" ");
  }
>
```

#### `<input>`

Supports `valueChange=` (for editable input types), `checkedChange=`, and `checkedValueChange=`:

```marko
<let/text="">
<input type="text" value:=text>
<input type="text" value=text valueChange(v) { text = v.toLowerCase() }>
```

> [!CAUTION]
> `<input>` always delivers string values. Convert numeric inputs in the handler or with a [refining function](./language.md#refining-function):
>
> ```marko
> <let/count=0>
>
> // ❌ sets `count` to a string on update
> <input type="number" value:=count>
>
> // ✅ converts the string value to a number
> <input type="number" value:parseFloat:=count>
> ```

Checkbox `checked=` binding:

```marko
<let/agreed=false>
<input type="checkbox" checked:=agreed>
```

Radio and multi-checkbox `checkedValue=` binding (a handler that ignores the new value keeps the current selection):

```marko
<let/speed="ground">
<label>
  <input type="radio" name="speed" value="ground" checkedValue:=speed>
  Ground
</label>
<label>
  <input type="radio" name="speed" value="overnight" checkedValue:=speed>
  Overnight
</label>

<let/toppings=["cheese"]>
<label>
  <input type="checkbox" value="cheese" checkedValue:=toppings>
  Cheese
</label>
<label>
  <input type="checkbox" value="olives" checkedValue:=toppings>
  Olives
</label>
```

#### `<select>` (`valueChange=`)

Supports `valueChange=` for single strings or string arrays (`multiple`):

```marko
<let/language="en">
<select value:=language>
  <option value="en">English</option>
  <option value="pt-br">Portuguese (Brazil)</option>
  <option value="it">Italian</option>
</select>
```

```marko
<let/topics=["runtime"]>
<select multiple value:=topics>
  <option value="runtime">Runtime</option>
  <option value="compiler">Compiler</option>
  <option value="tooling">Tooling</option>
</select>
```

#### `<textarea>` (`valueChange=`)

Supports `valueChange=` paired with `value=`:

```marko
<let/notes="">
<textarea value:=notes/>
```

#### `<details>`

Supports `openChange=` paired with `open=`. Without `openChange=`, `open=` applies only on initial render:

```marko
<let/open=false>
<details open:=open>
  <summary>Details</summary>
  <p>Expanded content</p>
</details>
<button onClick() { open = false }>Collapse</button>
```

#### `<dialog>`

Supports `openChange=` paired with `open=` for non-modal dialogs:

```marko
<let/open=false>
<dialog open:=open>Hello!</dialog>
<button onClick() { open = !open }>Toggle</button>
```

> [!WARNING]
> `openChange=` observes the `open` attribute via `MutationObserver` and controls non-modal dialogs only. Calling [`.showModal()`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLDialogElement/showModal) sets `open` and conflicts with a controlled `openChange=` binding. Manage modal dialogs directly with `.showModal()` and `.close()` without `openChange=`.

#### Form Reset

Resetting a form (`<button type="reset">` or [`form.reset()`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLFormElement/reset)) restores each controlled form element to its initial rendered value and invokes its change handler with that restored value so bound state stays synchronized:

```marko
<let/tracking="1Z999AA10">

<form>
  <input value:=tracking>
  <button type="reset">Reset</button>
</form>

<div>${tracking}</div>
```

> [!NOTE]
> Reset change handlers run on the next animation frame. Calling `preventDefault()` on the `reset` event cancels both the reset and the handler calls.

## Attribute Spreads

A [spread](./language.md#spread-attributes) on a native tag owns the element's attribute set: attributes removed from the spread object are removed from the DOM on update:

```marko
<let/link={ href: "/report.csv", download: "report.csv" }>

<a ...link>Quarterly report</a>
<button onClick() { link = { href: "/report.csv" } }>Open in browser</button>
```

> [!WARNING]
> Attribute removal covers every attribute on the element, including attributes added outside Marko. Place attributes that must persist either inside the spread object or after the spread.

Attributes written **after** a spread are excluded from the spread's ownership, letting wrapper tags pin or compose attributes while forwarding `input`:

```marko
<a ...input class=["external", input.class] target="_blank" rel="noreferrer"/>
```

Attributes written **before** a spread merge into the spread object and are overridden by matching keys in the spread. [`class=`](#class), [`style=`](#style), and [change handlers](#change-handlers) retain their special handling inside spreads. An [event handler](#event-handlers) written after a spread claims that event so the spread does not attach a duplicate listener, while still exposing the original handler on `input`.

```marko
<let/note="">
<const/composer={ rows: 4, value: note, valueChange(next) { note = next } }>

<textarea ...composer/>
```

## Enhanced Tags

Three HTML constructs have enhanced behavior in Marko, with raw fallbacks when literal HTML output is needed.

### `<script>`

Marko's [`<script>`](./core-tag.md#script) runs reactive browser effects. Emit a literal HTML `<script>` element with [`<html-script>`](./core-tag.md#html-script--html-style):

```marko
<html-script type="application/json">
  { "foo": ["bar", "baz"] }
</html-script>
```

### `<style>`

Marko's [`<style>`](./core-tag.md#style) extracts and bundles CSS. Emit a literal inline HTML `<style>` element with [`<html-style>`](./core-tag.md#html-script--html-style).

### `<!-- comment -->`

Marko strips [comments](./language.md#comments) by default. Emit a literal `<!-- comment -->` with [`<html-comment>`](./core-tag.md#html-comment).
