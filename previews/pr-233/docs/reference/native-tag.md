# Native Tags

Native tags are the [built-in HTML elements](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements). In Marko they behave like standard HTML with a few ergonomic enhancements.

## Element References

All native tags expose a [Tag Variable](./language.md#tag-variables) that provides a getter to the reference of the DOM node.

```marko
<div/ref/>

<script>
  ref().innerHTML = "Hello World"
</script>
```

> [!CAUTION]
> The node reference is only available in the browser. Attempting to access a DOM node from the server will result in an error.

## Enhanced Attributes

### `class=`

In addition to strings, Marko supports passing arrays and objects to the `class=` attribute.

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

Each key of an object is a class name, included when its value is truthy. Every falsy value drops the class. Objects are read one level deep: a value is only tested for truthiness, never traversed.

Arrays may be nested to any depth and spread, and their falsy entries are skipped. Class names are not deduplicated, and when nothing remains the attribute is omitted entirely.

```marko
<let/query="">

<input
  value:=query
  class=["field", query && ["field-filled", { "field-error": !query.trim() }]]
>
```

### `style=`

In addition to strings, Marko supports passing arrays and objects to the `style=` attribute.

```marko
// string
<div style="display:block;margin-right:16px"/>

// object
<div style={ display: "block", "margin-right": "16px" }/>

// array
<div style=["display:block", null, { "margin-right": "16px" }]/>
```

All three produce the declaration list `display:block;margin-right:16px`. Declarations are joined with `;`, and no trailing `;` is added.

Object keys are written out verbatim, so they must be hyphen-case CSS property names.

> [!WARNING]
> Unlike [the DOM `style` API](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style), keys are never converted, so a camelCased key renders as invalid CSS the browser ignores.
>
> ```marko
> // ❌ (INCORRECT) renders `backgroundColor:red`
> <div style={ backgroundColor: "red" }/>
>
> // ✅
> <div style={ "background-color": "red" }/>
> ```
>
> The compiler warns on camelCased keys it can see statically, and debug builds warn at runtime for keys from dynamic objects. Both suggest the hyphen-case name.

Values are stringified as-is, with no unit inference: `style={ "margin-right": 16 }` renders `margin-right:16`, not `margin-right:16px`. Numbers are only meaningful for unitless properties such as `line-height` or `z-index`, and the TypeScript types reject any number other than `0` for length properties.

A declaration is dropped when its value is `false`, `null`, `undefined` or an empty string, but `0` is kept, so `style={ width: 0 }` renders `width:0`. This differs from `class=` objects, where every falsy value drops the class.

> [!TIP]
> The TypeScript types reject `false` as an object value, so conditional declarations belong at the array level.
>
> ```marko
> <div style=["display:block", isError && { color: "red" }]/>
> ```

Arrays nest and spread exactly as they do for [`class=`](#class). Custom properties are written out like any other key, though the TypeScript types require [registering](./typescript.md#registering-css-properties-eg-for-custom-properties) each one.

### `content=`

Native tags accept their body content as a `content=` attribute. The value may be a [`<define>`](./core-tag.md#define) tag variable, an imported template, or the [content](./language.md#tag-content) the surrounding template received.

Because `content` arrives as part of `input`, a [spread](./language.md#spread-attributes) is enough to implement a tag that wraps an element around the content it receives.

```marko
/* field-row.marko */
<fieldset ...input/>
```

```marko
/* signup.marko */
<field-row class="row">
  <label for="email">Email</label>
  <input id="email" name="email" type="email">
</field-row>
```

The spread applies `class` to the `<fieldset>` and renders the content inside it:

```html
<fieldset class="row"><label for="email">Email</label><input id="email" name="email" type="email"></fieldset>
```

Passing the attribute explicitly places the content on a specific element, such as an inner wrapper:

```marko
<section class="card">
  <h2>${input.title}</h2>
  <div class="card-body" content=input.content/>
</section>
```

`content=` is reactive. Swapping the value replaces the rendered content in place, leaving the element itself untouched.

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

<button onClick() { expanded = !expanded }>toggle</button>
```

> [!WARNING]
> A literal body takes precedence over `content=`, which is then never rendered. Any body counts, including one that produces no output of its own, such as a body holding only a [comment](./language.md#comments).
>
> ```marko
> <div content=Summary>
>   // this comment is body content, so `Summary` never renders
> </div>
> ```

Attributes are merged from left to right, so ordering decides the result when `content=` accompanies a spread. Setting it after a spread overrides the content coming from that spread, and `content=undefined` forwards every other attribute while dropping the content entirely.

```marko
<div ...input content=undefined/>
```

Tags that cannot contain markup reject the attribute at compile time. [Void elements](https://developer.mozilla.org/en-US/docs/Glossary/Void_element) such as `<img>` report:

```text
The `<img>` tag cannot have content, so it does not support the `content` attribute.
```

`<textarea>` and `<title>` take their body as text, and report:

```text
The `<textarea>` tag takes its content from its body as text, so it does not support the `content` attribute.
```

> [!NOTE]
> On [`<meta>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/meta), `content` is a real HTML attribute and keeps that meaning, including when applied through a spread. It is the only native tag whose `content` is written to the element instead of rendered as content.
>
> ```marko
> <let/height=630>
> <meta property="og:image:height" content=height>
> ```

For typing content on a custom tag, see [Typing `content`](./typescript.md#typing-content).

### Event Handlers

Attributes on native tags that begin with `on` followed by `-` or a capital letter are attached as [event handlers](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener).

When the attribute starts with `on-` the event name casing is preserved, otherwise the event name is all lowercased.

- `onDblClick` → `dblclick`
- `on-DblClick` → `DblClick`

```marko
<button onClick() { alert("Hi!") }>
  Say Hi
</button>

// equivalent to

<button on-click() { alert("Hi!") }>
  Say Hi
</button>
```

> [!NOTE]
> Event handlers are typically written using the [method shorthand](./language.md#shorthand-methods) for readability.

The value for the attribute must be either a function or a [falsy](https://developer.mozilla.org/en-US/docs/Glossary/Falsy) value, allowing for conditional event handlers:

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
> Since native events are all lowercase, the `onCamelCase` event naming can help with readability of multi-word events:
>
> ```marko
> <canvas onContentVisibilityAutoStateChange() {  }/>
> ```
>
> Some [custom elements](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements) may emit non lowercase event names, in which case (pun intended 😏) you should use `on-` which preserves the casing.

<!---->

> [!CAUTION]
> Even though Marko _does_ support [native HTML inline event handler attributes](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes#event_handler_attributes), it's recommended to avoid them since they're detached from Marko's reactivity system and may lead to [CSP](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP) / [XSS](https://developer.mozilla.org/en-US/docs/Glossary/Cross-site_scripting) issues.
>
> ```marko
> <button onclick="this.innerHTML++">0</button>
> ```

#### Handler Arguments

An event handler receives two arguments: the [`Event`](https://developer.mozilla.org/en-US/docs/Web/API/Event) and the element the handler was attached to.

```marko
<form onSubmit(event, form) {
  event.preventDefault();
  fetch("/subscribe", { method: "POST", body: new FormData(form) });
}>
  <input name="email" type="email">
  <button>Subscribe</button>
</form>
```

The second argument matters when an event originates from a descendant. `event.target` is the element the event was dispatched on, which for a click inside a `<button>` may be an inner `<span>`, while the second argument is always the element carrying the `on*` attribute.

> [!WARNING]
> [`event.currentTarget`](https://developer.mozilla.org/en-US/docs/Web/API/Event/currentTarget) is not available in Marko event handlers. Because handlers are [delegated](#delegation), `currentTarget` is the `document` in an optimized build, and in a debug build reading it logs an error to the console and evaluates to `null`. The second argument, or an [element reference](#element-references), replaces it.

#### Delegation

Marko does not call `addEventListener` for each element. The first time a handler for an event type is attached, a single listener for that type is registered on the `document` with [capture](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener#capture) enabled. When the event fires, that listener invokes the handler on the event's target and then, for events that bubble, the handler on each of its ancestors.

This has a few observable effects.

- Marko handlers run before listeners added with `addEventListener` on the element itself or on any ancestor below the `document`.
- `event.stopPropagation()` in a Marko handler prevents handlers on ancestor elements from running, and stops the event before it reaches any `addEventListener` listener below the `document`, including one on the same element. Calling it from a listener attached below the `document` has no effect on Marko handlers, which have already run.
- Events that do not bubble, such as `focus`, `blur`, and `load`, only reach a handler on the element the event was dispatched on. A handler on an ancestor is never called for them.

### Tags with Enhanced `value` Attributes

The HTML `<input>` tag has a `value=` attribute that reflects the state of the `<input>`. Marko adds this attribute to a few other tags that hold internal state.

#### `<input type="radio">` and `<input type="checkbox">`

Radio and checkbox inputs support a `checkedValue=` attribute. When this attribute matches the input's `value=` attribute, it will be `checked`.

`checkedValue=` may be set to a string, in which case only one value will match (for use with `type="radio"`), or an array of strings, in which case multiple values may match (for use with `type="checkbox"`).

#### `<select>`

The `<select>` tag is unique in that its state is internally synchronized with the `<option>` tags in its body. Marko exposes this state via the `value=` attribute.

`value=` may be set to a string in which case it mirrors the `<select>`'s `.value` property - the value of the selected `<option>`. It may also be set to an array of strings in which case multiple `<option>`s may be selected (for use with `<select multiple>`).

Marko renders `selected` on each nested `<option>` whose `value=` matches, rather than writing an attribute to the `<select>`. The comparison is between strings: `value=25` matches `<option value="25">`, and `undefined` or `null` matches an `<option>` with an empty `value=`. An array matches element-wise, selecting every `<option>` whose value it contains.

Every `<option>` inside a `<select>` that has `value=` or `valueChange=` must carry its own `value=`, including options nested in [`<optgroup>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/optgroup) or a control flow tag such as [`<for>`](./core-tag.md#for). An `<option>` without one is a compile error.

> [!WARNING]
> `selected=` on an `<option>` inside such a `<select>` is also a compile error. The initial selection comes from the select's `value=`.

#### `<textarea>`

In HTML, `<textarea>` holds its value inside its body. In Marko, this state can also be held in the `value=` attribute, which is useful for the textarea change handler.

### Change Handlers

Some native tags in Marko have additional attributes that make them **controllable**. These attributes end with `Change` and are designed to work with the [bind shorthand](./language.md#shorthand-change-handlers-two-way-binding).

For DOM elements that maintain internal state separate from an associated attribute, Marko uses "uncontrolled" attributes by default, meaning it only sets the attribute value and not the internal value.

```marko
<input value="hello">
```

Above is among the simplest of examples, but interestingly its behavior is different across frameworks in subtle ways.

In some frameworks, like React, this would be a "read-only" `<input>`. Marko takes a different approach, allowing the input's state to be managed natively by the browser.

Adding state introduces some nuances in behavior.

```marko
<let/message="hello">

<input value=message>

<div>${message}</div>

<button onClick() { message = "goodbye" }>Click Me</>
```

In this example, typing in the `<input>` and then clicking the `<button>` might not behave as expected. The `<div>` text updates only when the button is clicked, and the `<input>` doesn't reflect the new "goodbye" value.

This occurs because there are two separate states, which update independently:

1. The Marko-managed state in `<let/message>`
2. The internal state of the `<input>` value

To synchronize these two states and their updates, Marko includes a special `valueChange` attribute on `<input>`.

```marko
<let/message = "hello">

<input value=message valueChange() {}>

<div>${message}</div>

<button onClick() { message = "goodbye" }>Click Me</>
```

The `valueChange` attribute transforms the behavior:

- Typing in the `<input>` updates both the `<input>` and the `<div>`
- Clicking the `<button>` updates both the `<input>` and the `<div>`

There is now only one state! This synchronization occurs because `valueChange`:

1. Captures internal `<input>` changes
2. Updates the `message` variable, which then updates the `value=` attribute

The `valueChange` function is called whenever the `<input>` would normally update, allowing a parent component to synchronize its state with the input's internal state.

```marko
<let/message = "hello">

<input value=message valueChange(newMessage) { message = newMessage }>

<div>${message}</div>

<button onClick() { message = "goodbye" }>Click Me</>
```

In this example, there is a single state _and_ updates from both sources are handled. Typing in the `<input>` and clicking the `<button>` cause changes to both the `<div>` and the `<input>` itself. Everything is in sync!

Marko has [a shorthand](./language.md#shorthand-change-handlers-two-way-binding) for simple reflective change handlers like this, allowing the example to be simplified to:

```marko
<let/message="Hello">

<input value:=message>

<div>${message}</div>

<button onClick() { message = "Goodbye" }>Click Me</>
```

With this shorthand all that is needed to go from "uncontrolled" to "controlled" for the `value` attribute was to swap from `value=` to `value:=`.

For cases besides the most simple, manual `valueChange` handlers are required.

```marko
<let/message = "hello">

<input value=message valueChange(newMessage) { message = newMessage.toLowerCase() }>

<div>${message}</div>

<button onClick() { message = "goodbye" }>Click Me</>
```

All changes to this `<input>` are intercepted _and manipulated_. In this example, all UPPERCASE characters are automatically converted to lowercase. This pattern is useful for [input masking](https://css-tricks.com/input-masking/) and more - and it's built in!

```marko
// uncontrolled - The browser owns the state
<input value="hello">

// controlled - The `inputValue` tag variable owns the state
<let/inputValue="hello">
<input value:=inputValue>

// controlled - Modifications to `<input>` are transformed
<let/creditCardNumber="5555 5555 555">
<input
  value=creditCardNumber
  valueChange(v) {
    creditCardNumber = [...v.replace(/\D/g, "").matchAll(/\d{1,4}/g)].join(" ");
  }
>
```

#### `<input>` (`valueChange=`, `checkedChange=`, `checkedValueChange=`)

The `<input>` tag has 3 change handlers, which are each related to an input type.

The `value=` attribute may be controlled with `valueChange=`

```marko
<let/text="">
<input type="text" value:=text>
<input type="text" value=text valueChange(value) { text = value.toLowerCase() }>
```

> [!CAUTION]
> The value of `<input>` is _always_ a string, so numbers need to be casted.
>
> ```marko
> <let/number=0>
>
> // ❌ (INCORRECT) this will set number to a string when updated
> <input type="number" value:=number>
>
> // ✅ cast the string value to a number during the change handler
> <input type="number" value=number valueChange(value) { number = +value }>
> ```

The `checked=` attribute may be controlled with `checkedChange=`

```marko
<let/checked=false>
<input type="checkbox" checked:=checked>
<input type="checkbox" checked=checked checkedChange(value) { checked = value }>
```

The [added `checkedValue=` attribute](#input-typeradio-and-input-typecheckbox) also has a change handler.

```marko
<let/checked="foo">
<input type="radio" value="foo" checkedValue:=checked>
```

#### `<select>` (`valueChange=`)

The `<select>` tag has a change handler for [Marko's added `value=` attribute](#select).

```marko
<let/language="en">
<select value:=language>
  <option value="en">English</option>
  <option value="pt-br">Portuguese (Brazil)</option>
  <option value="it">Italian</option>
</select>
```

The handler receives the selected option's value as a string, or an array of the selected values when `value=` is an array. Other state types are converted in the handler.

```marko
<let/pageSize=25>

<select value=pageSize valueChange(size) { pageSize = +size }>
  <for|n| of=[10, 25, 50]>
    <option value=n>${n} per page</option>
  </for>
</select>
```

> [!WARNING]
> A controlled `value` matching no `<option>` leaves the browser's default selection in place instead of the value held in state.

#### `<textarea>` (`valueChange=`)

The `<textarea>` tag has a change handler for [Marko's added `value=` attribute](#textarea).

```marko
<let/text="">
<textarea value:=text/>
```

#### `<details>` (`openChange=`)

The `<details>` tag has a change handler for its `open=` attribute.

```marko
<let/open=false>
<details open:=open/>

<button onClick() { open = false }>
  Collapse
</button>
```

#### `<dialog>` (`openChange=`)

The `<dialog>` tag has a change handler for its `open=` attribute.

```marko
<let/open=false>
<dialog open:=open>Hello!</dialog>

<button onClick() { open = !open }>
  Toggle
</button>
```

> [!Warning]
> The `open` attribute of the `<dialog>` tag can be used to control a non-modal dialog. However if you need a modal dialog, you should use [the `.showModal()` method](https://developer.mozilla.org/en-US/docs/Web/API/HTMLDialogElement/showModal) directly. Calling this method will _not_ cause `openChange` to fire as the HTML `<dialog>` only fires an event on `close`.

## Enhanced Tags

Some native tags have special meaning in Marko, and don't behave exactly like their HTML counterpart.

### `<script>`

Marko's [`<script>` tag](./core-tag.md#script) is used for browser effects.

A native HTML `<script>` may be included with `<html-script>`.

```marko
<html-script type="application/json">
  { "foo": [ "bar", "baz" ] }
</html-script>
```

### `<style>`

Marko's [`<style>` tag](./core-tag.md#style) generates `.css` files.

Though almost never recommended, a native HTML `<style>` may be included with `<html-style>`.

### `<!-- comment -->`

By default, Marko strips [comments](./language.md#comments) from the output.

A native HTML `<!-- comment -->` may be included with [`<html-comment>`](./core-tag.md#html-comment)
