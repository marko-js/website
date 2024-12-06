# Native Tags

## Element References

All native tags expose a [Tag Variable](./language.md#Tag-Variable) which provides a getter to the reference of the DOM node.

```marko
<div/ref/>

<script>
  ref().innerHTML = "Hello World"
</script>
```

> [!Caution]
> The node reference is only available in the browser. If you try to access a DOM node from the server, it will result in an error.

## Enhanced Attributes

### `class=`

In addition to a string, Marko supports passing arrays and objects to the `class=` attribute.

```marko
<!-- string: -->
<div class="a c"/>

<!-- object: -->
<div class={ a:true, b:false, c:true }/>

<!-- array: -->
<div class=["a", null, { c:true }]/>
```

All of the examples listed here have the same result:

```html
<div class="a c"></div>
```

### `style=`

In addition to a string, Marko supports passing arrays and objects to the `style=` attribute.

```marko
<!-- string: -->
<div style="display:block;margin-right:16px"/>

<!-- object: -->
<div style={ display: "block", color: false, "margin-right": 16 }/>

<!-- array: -->
<div style=["display:block", null, { "margin-right": 16 }]/>
```

All of the examples listed here have the same result:

```marko
<div style="display:block;margin-right:16px;"></div>
```

### Event handlers

Attributes on native tags that begin with `on` followed by `-` or a captial letter are attached as [event handlers](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener).

When the attribute starts with `on-` the event name casing is preserved, otherwise the event name is all lowercased.

- `onDblClick` → `dblclick`
- `on-DblClick` → `DblClick`

```marko
<button onClick() { alert("Hi!") }>
  Say Hi
</button>
```

> [!Note]
> Event handlers are typically written using the [method shorthand](./language.md#Shorthand-Methods) for readability.

The value for the attribute must either be a function or a [falsy](https://developer.mozilla.org/en-US/docs/Glossary/Falsy) value. This allows for conditional event handlers:

```marko
<let/clicked=false/>
<button onClick=!clicked && (() => {
  alert("First click!");
  clicked = true;
})>
  Click me!
</button>
```

> [!Tip]
> Since native events are all lowercase, the `onCamelCase` event naming can help with readability of multi-word events:
>
> ```marko
> <canvas onContentVisibilityAutoStateChange() {  }/>
> ```
>
> Some [custom elements](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements) may emit non lowercase event names, in which case (pun intended 😏) you should use `on-` which preserves the casing.

> [!Caution]
> Although Marko _does_ support [native html inline event handler attributes](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes#event_handler_attributes), and that's pretty cool, you probably shouldn't use them since they're detached from Marko's reactivity system and may lead to [CSP]() / [XSS]() issues.
>
> ```marko
> <button onclick="this.innerHTML++">0</button>
> ```

### Tags with Enhanced `value` Attributes

The HTML `<input>` tag has a `value=` attribute that reflects the state of the `<input>`. Marko adds this attribute to a few other tags that hold internal state.

#### `<input type="radio">` and `<input type="checkbox">`

Radios and Checkboxes support a `checkedValue=` attribute. When this attribute matches the input's `value=` attribute, it will be `checked`.

`checkedValue=` may be set to a string, in which case only one value will match (for use with `type="radio"`), or an array of strings, in which case multiple values may match (for use with `type="checkbox"`).

#### `<select>`

The `<select>` tag is unique in that its state is internally synchronized with its the `<option>` tags in its body. Marko exposes this state via the `value=` attribute.

`value=` may be set to a string in which case it mirrors the `<select>`'s `.value` property - the value of the selected `<option>`. It may also be set to an array of strings in which case multiple `<option>`s may be selected (for use with`<select multiple>`).

#### `<textarea>`

In HTML, `<textarea>` holds its value inside its body. In Marko, this state may also be held in the `value=` attribute. This is useful for the textarea change handler.

### Change Handlers

Some native tags in Marko have additional attributes which make them [controllable](TODO). All of these attributes end with `Change`, and are designed to take advantage of the [bind shorthand](./language.md#Shorthand-Change-Handlers-Two-Way-Binding).

There are several DOM elements that maintain internal state separate from an associated attribute. In Marko such attributes are "uncontrolled", meaning that Marko will _only_ set the attribute value by default and not the internal value.

```marko
<input value="hello">
```

Above is among the simplest of examples, but interestingly its behavior is different across frameworks in subtle ways.

In some frameworks this will (conceptually) create a "read only" `<input>`. Marko opts not to do this, instead the user can freely type in the `<input>`.

Adding `state` complicates things further.

```marko
<let/message="hello"/>

<input value=message>

<div>${message}</div>

<button onClick() { message = "goodbye" }>Click Me</>
```

Now typing in the `<input>` and then clicking the `<button>` leads to a (perhaps) suprising behavior.
Firstly, the `<div>` text is not updated until we click the `<button>` and then `<input>` doesn't get set to "goodbye"!

The issue here is that there are actually two states not one. The state owned by Marko in the `<let/message>` and the internal state of the `<input>` value. These states are also updated at different times.

To solve this problem, at a fundamental level, the two states and their updates need to be synchronized.

To help with this, Marko has a special `valueChange` attribute on `<input>`.

```marko
<let/message = "hello"/>

<input value=message valueChange() {}>

<div>${message}</div>

<button onClick() { message = "goodbye" }>Click Me</>
```

In the above we've set the `valueChange` attribute to an empty function.

Running through the previous steps (typing in the `<input>` and clicking `<button>`) we see a different behavior.

Typing in the `<input>` does _nothing_ and clicking the `<button>` now updates the `<input>` to "goodbye".

This is because with the `valueChange` attribute the `<input>` will ignore its internal state changes and is synchronized with the state provided through the `value=` attribute. There is now only one state!

The `valueChange` is called whenever the `<input>` _would have_ updated its internal state with a new value. However since `valueChange` does nothing, we are in essence ignoring the updates from the `<input>`.

```marko
<let/message = "hello"/>

<input value=message valueChange(newMessage) { message = newMessage }>

<div>${message}</div>

<button onClick() { message = "goodbye" }>Click Me</>
```

There is now a single state _and_ updates from both sources are handled. Typing in the `<input>` and clicking the `<button>` cause changes to both the `<div>` and the `<input>` itself. Everything is in sync!

Marko has [a shorthand](./language.md#Shorthand-Change-Handlers-Two-Way-Binding) for simple reflective change handlers like this, allowing the example to be simplified to:

```marko
<let/message="Hello"/>

<input value:=message>

<div>${message}</div>

<button onClick() { message = "Goodbye" }>Click Me</>
```

With this shorthand all that is needed to go from "uncontrolled" to "controlled" for the `value` attribute was to swap from `value=` to `value:=`, easy!

As a final example lets do something simple, but interesting, with a manual `valueChange` handler.

```marko
<let/message = "hello"/>

<input value=message valueChange(newMessage) { message = newMessage.toLowerCase() }>

<div>${message}</div>

<button onClick() { message = "goodbye" }>Click Me</>
```

When typing into the `<input>` above all changes are intercepted _and manipulated_. The `<input>` now disallows any UPPER_CASE characters! This pattern is incredibly useful for [input masking](https://css-tricks.com/input-masking/) and more - and it's built in!

TLDR:

```marko
// uncontrolled - browser owns the state
<input value="hello">

// controlled - we own the state
<let/value="hello"/>
<input value:=value>

// controlled - and we can get crazy with it
<let/creditCardNumber="5555 5555 555"/>
<input
  value=creditCardNumber
  valueChange(v) {
    creditCardNumber = [...v.replace(/\D/g, "").matchAll(/\d{1,4}/g)].join(" ");
  }
>
```

#### `<input>` (`valueChange=`, `checkedChange=`, `checkedValueChange=`)

The `<input>` tag has 3 change handlers, which are each related to an input type.

```marko
<let/text=""/>
<input type="text" value:=text>
<input type="text" value=text valueChange(value) { text = value.toLowerCase() }>
```

```marko
<let/checked=false/>
<input type="checkbox" checked:=checked>
```

The [added `checkedValue=` attribute](#ltinput-typeradiogt-and-ltinput-typecheckboxgt) also has a change handler.

```marko
<let/checked="foo"/>
<input type="radio" value="foo" checkedValue:=checked>
```

#### `<select>` (`valueChange=`)

Traditionally, the value of a `<select>` is controlled via the `selected=` attribute in its `<option>` tags. Marko adds an additional way to control the `<select>` using [a new `value=` attribute](#ltselectgt), which is also controllable with a `Change` handler.

#### `<textarea>` (`valueChange=`)

The `<textarea>` tag has a change handler for [Marko's added `value=` attribute](#lttextareagt).

```marko
<let/text=""/>
<textarea value:=text/>
```

#### `<details>` (`openChange=`)

The `<details>` tag has a change handler for its `open=` attribute.

```marko
<let/open=false/>
<details open:=open/>

<button onClick() { open = false }>
  Collapse
</button>
```

#### `<dialog>` (`openChange=`)

The `<dialog>` tag has a change handler for its `open=` attribute.

```marko
<let/open=false/>
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

Marko's [script tag](./core-tags.md#ltscriptgt) is used for browser effects.

A native HTML `<script>` may be included with `<html-script>`.

```marko
<html-script type="application/json">
  { "foo": [ "bar", "baz" ] }
</html-script>
```

### `<style>`

Marko's [style tag](./core-tags.md#ltstylegt) generates `.css` files.

Though almost never recommended, a native HTML `<style>` may be included with `<html-style>`.

### `<!-- comment -->`

By default, Marko strips [comments](./language.md#Comments) from the output.

A native HTML `<!-- comment -->` may be included with [`<html-comment>`](./core-tags#lthtmlcommentgt)
