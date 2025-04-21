# Native Tags

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
<!-- String -->
<div class="a c"/>

<!-- Object -->
<div class={ a: true, b: false, c: true }/>

<!-- Array -->
<div class=["a", null, { c: true }]/>
```

All examples above result in the same HTML:

```html
<div class="a c"></div>
```

### `style=`

In addition to strings, Marko supports passing arrays and objects to the `style=` attribute.

```marko
<!-- String -->
<div style="display:block;margin-right:16px"/>

<!-- Object -->
<div style={ display: "block", color: false, "margin-right": 16 }/>

<!-- Array -->
<div style=["display:block", null, { "margin-right": 16 }]/>
```

All examples above result in the same HTML:

```html
<div style="display:block;margin-right:16px;"></div>
```

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

<!--  -->

> [!CAUTION]
> Even though Marko _does_ support [native HTML inline event handler attributes](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes#event_handler_attributes), it's recommended to avoid them since they're detached from Marko's reactivity system and may lead to [CSP](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP) / [XSS](https://developer.mozilla.org/en-US/docs/Glossary/Cross-site_scripting) issues.
>
> ```marko
> <button onclick="this.innerHTML++">0</button>
> ```

### Tags with Enhanced `value` Attributes

The HTML `<input>` tag has a `value=` attribute that reflects the state of the `<input>`. Marko adds this attribute to a few other tags that hold internal state.

#### `<input type="radio">` and `<input type="checkbox">`

Radio and checkbox inputs support a `checkedValue=` attribute. When this attribute matches the input's `value=` attribute, it will be `checked`.

`checkedValue=` may be set to a string, in which case only one value will match (for use with `type="radio"`), or an array of strings, in which case multiple values may match (for use with `type="checkbox"`).

#### `<select>`

The `<select>` tag is unique in that its state is internally synchronized with the `<option>` tags in its body. Marko exposes this state via the `value=` attribute.

`value=` may be set to a string in which case it mirrors the `<select>`'s `.value` property - the value of the selected `<option>`. It may also be set to an array of strings in which case multiple `<option>`s may be selected (for use with`<select multiple>`).

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

Traditionally, the value of a `<select>` is controlled via the `selected=` attribute in its `<option>` tags. Marko adds an additional way to control the `<select>` using [a new `value=` attribute](#select), which is also controllable with a `Change` handler.

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
