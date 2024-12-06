# Language Reference

Marko is a superset of [well-formed](https://en.wikipedia.org/wiki/Well-formed_document) HTML.

The language makes HTML more strict while extending it with control flow and reactive data bindings. It does this by meshing JavaScript syntax features with HTML and introducing a few new syntaxes of its own. Most HTML is valid Marko but there are some important deviations.

> [!TIP]
> Marko also supports a [beautiful concise syntax](./concise.md). If you'd prefer to see the documentation using this syntax, just click the `switch syntax` button in the corner of any Marko code sample.

> TODO: Move this to concise mode docs but link to it from getting-started.md [name=Doctor P]

> [!IMPORTANT]
> Text at the root of a template (outside any tags) must be prefixed with the [concise syntax's `--`](./concise.md#text) to denote it is text. The parser starts in concise mode and would otherwise try to parse what you meant to be text as a concise tag declaration.
>
> ```marko
> -- Root level text
> ```

## Syntax Legend

Below is not only valid Marko code, but also a representation of almost all of Marko's syntax. You can view information about each piece of syntax by clicking on it.

<pre>
<a href="#Statements">import "...";</a>

&lt;<a href="#Tags">tag-name</a>|<a href="#Tag-Parameters">tag, parameters</a>|/<a href="#Tag-Variables">tagVariable</a> ...<a href="#Attributes">attributes</a>&gt;
  <a href="#Tag-Content">content</a>
  &lt;<a href="#Attribute-Tags">@attribute-tag</a>/&gt;
&lt;/<a href="#Tags">tag-name</a>&gt;
</pre>

## Template Variables

Within Marko templates a few variables are automatically made available.

### `input`

Gives access to the [attributes](#Attributes) the template was provided as a custom tag or the data passed in through the [top level api](./template-api.md).

### `$signal`

An [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) which is aborted when the given template or [tag content](./#Tag-Content) is removed from the DOM, or if the expression the `$signal` is used in was invalidated.

This is primarily to handle cleaning up side effects.

### `$global`

Gives access the ["render globals"](./template-api.md#$global) provided through the [top level api](./template-api.md).

## Statements

Marko supports a few module scoped top level statements.

### `import`

JavaScript [`import`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import) statements are allowed at the root of the template.

```marko
import sum from "sum"

<div data-number=sum(1, 2)></div>
```

There is also a shorthand for importing [custom tags](#Custom-Tag) by using angle brackets in the `from` of the import, which will use Marko's [custom tag discovery logic](#Custom-Tags).

```marko
import MyTag from "<my-tag>"
```

### `export`

JavaScript [`export`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/export) statements are allowed at the root of the template.

```marko
export function getAnswer() {
  return 42
}

<div>${getAnswer()}</div>
```

### `static`

Statements prefixed with `static` allow running JavaScript expressions in module scope.
The statements will run when the template loaded on the server and in the browser.

```marko
static const answer = 41
static function getAnswer() { return answer + 1 }

<div data-answer=getAnswer()></div>
```

After the `static` keyword you can have any valid javascript statement, including functions, declarations, conditions, etc, and it will execute in the module scope of the template (e.g. when the template is first imported).

### `server` and `client`

Statements prefixed with `server` or `client` allow arbitrary module scoped JavaScript expressions (like `static`) but are exclusively executed when the template is loaded in either the server or browser, respectively.

```marko
server console.log("on the server")

client console.log("in the browser")
```

> [!TIP]
> The [`import`](#import) statement is really a shortcut for `static import`. This can be leveraged with `server` and `client` if you want a module to only be imported on one platform
>
> ```marko
> server import "./init-db"
> client import "bootstrap"
> ```

## Tags

As you might expect, Marko supports all native HTML/SVG/whatever tags and attributes. In addition to these, a set of useful [core tags](./core-tags.md) are provided. You can also build your own [custom tags](./custom-tags.md) and [install third-party tags](./custom-tags.md#using-tags-from-npm) from `npm`.

All of these types of tags use the same syntax:

```marko
<my-tag/>
```

`.marko` files are [automatically discovered](./custom-tag#Discovery) as [custom tags](./custom-tag) (no need for `import`).

All tags can be [self closed](https://developer.mozilla.org/en-US/docs/Glossary/Void_element#self-closing_tags) when there is no [content](#Tag-Content). This means `<div/>` is valid, unlike in HTML. Additionally [`void` tags](https://developer.mozilla.org/en-US/docs/Glossary/Void_element) like `<input>` and `<br>` can be [self closed](https://developer.mozilla.org/en-US/docs/Glossary/Void_element#self-closing_tags).

In all closing tags, the tag name may be omitted.

```marko
<div>Hello World</>
```

### Dynamic Tag

You can also dynamically output a native tag, [custom tag](#Custom-Tag), or [tag content](#Tag-Content) by `${interpolating}` within the tag name.

With a dynamic tag the closing tag should be `</>`, or if there is no [content](#Tag-Content) you can self close the tag.

#### Dynamic Native Tags

When the value of the dynamic tag name is a string,

```marko
// Dynamically output a native tag.
<${"h" + input.headingSize}>Hello!</>
```

#### Dynamic Custom Tags

```marko
// Dynamically output a custom tag.
import MyTagA from "<my-tag-a>"
import MyTagB from "<my-tag-b>"
<${Math.random() > 0.5 ? MyTagA : MyTagB}/>
```

> [!CAUTION]
> When rendering a custom tag, you must have a reference to it, the following is _not_ equivalent to the above example. In this case, Marko will output a native HTML element (as if you called `document.createElement("my-tag-a")`).
>
> ```marko
> <${Math.random() > 0.5 ? "my-tag-a" : "my-tag-b"}/>
> ```

> [!NOTE]
> If an object is provided with a `content` property, the `content` value will become the dynamic tag name. This is how the [define](./core-tags.md#Define) tag works under the hood 🤯.
>
> ```marko
> <define/Message>
>   Hello World
> </define>
> <${Message}/>
> ```
>
> Although in this case you should prefer a [PascalCase](#PascalCase-Variables) `<Message>` tag instead.

#### Conditional Parent Tags

When a dynamic tag name is [falsy](https://developer.mozilla.org/en-US/docs/Glossary/Falsy) it will output the tag's [content](#Tag-Content) only. This is useful for conditional parenting and fallback content.

```marko
// Only wrap the text with an anchor when we have an `input.href`.
<${input.href && "a"} href=input.href>Hello World</>
```

#### PascalCase Variables

Local variable names that start with an upper case letter (`PascalCase`) can also be used as tag names without the explicit dynamic tag syntax. This is useful for referencing an imported custom tag or with the [`<define>` tag](#Define).

```marko
import MyTag from "./my-tag.marko"

<MyTag/>
```

This is equivalent to

```marko
import MyTag from "./my-tag.marko"

<${MyTag}/>
```

## Attributes

Attribute values are JavaScript expressions:

```marko
<my-tag str="Hello"></my-tag>
<my-tag str=`Hello ${name}`></my-tag>
<my-tag num=1 + 1></my-tag>
<my-tag date=new Date()></my-tag>
<my-tag fn=function myFn(param1) { console.log("hi") }></my-tag>
```

Almost all valid JavaScript expressions can be written as the attribute value.
Even with `<my-tag str="Hello">` the `"Hello"` string is a JavaScript string literal and not an html attribute string.

Attributes can be thought of as JavaScript objects in Marko which are passed to a tag.

> [!CAUTION]
> Values cannot contain an unenclosed `>` since it is ambiguous. These expressions must use parentheses:
>
> ```marko
> <my-tag value=(1 > 2)></my-tag>
> ```

### Skipped Attributes

If an attribute value is `null`, `undefined` or `false` it will not be written to the html.

> [!NOTE]
> Not _all_ [falsy](https://developer.mozilla.org/en-US/docs/Glossary/Falsy) values are skipped. `0`, `NaN`, and `""` will still be written.

### Boolean Attributes

[HTML boolean attributes](https://developer.mozilla.org/en-US/docs/Glossary/Boolean/HTML) become JavaScript booleans.

```marko
<input type="checkbox" checked>
<input type="checkbox" checked=true>
```

> [!IMPORTANT] > [ARIA enumerated attributes](https://developer.mozilla.org/en-US/docs/Glossary/Enumerated#aria_enumerated_attributes) use strings instead of booleans, so make sure to pass a string.
>
> ```marko
> <button aria-pressed=isPressed /> // 👎
> <button aria-pressed=isPressed && "true" /> // 👍
> ```

### Spread Attributes

You can [spread](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax#spread_in_object_literals) an object with attribute values.

```marko
<my-tag ...input foo="bar"/>
```

In this case `<my-tag>` would receive the attributes as an object like `{ ...input, foo: "bar" }`.
Any number of spread attributes can be applied to a tag which will be merged before being provided as [input](#input).

> [!NOTE]
> The value after the `...` [(like in JavaScript)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax#spread_in_object_literals) can be any valid JavaScript expression.

### Shorthand Methods

[Method definitions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Method_definitions) allow for a concise way to pass functions as attributes, such as event handlers.

```marko
<button onClick(ev) { console.log(ev.target) }>Click Me</button>
```

### Shorthand Change Handlers (Two-Way Binding)

The recommended convention for synchronizing state with child components is to provide two attributes: a value, and a callback for when that value changes.

The change handler shorthand (`:=`) will supply both the value for an attribute, and a change handler whose name is the attribute's name with a "Change" suffix.
The value in the shorthand must be an [Identifier](https://developer.mozilla.org/en-US/docs/Glossary/Identifier) or a [Property Accessor](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Property_accessors).

For [Identifiers](https://developer.mozilla.org/en-US/docs/Glossary/Identifier), the change handler desugars to a function with an assignment.

```marko
<counter value:=count/>

// desugars to

<counter value=count valueChange(newCount) { count = newCount }/>
```

For [Property Accessors](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Property_accessors), the change handler desugars to a member expression with a `Change` suffix.

```marko
<counter value:=input.count/>

// desugars to

<counter value=input.count valueChange=input.countChange/>
```

### Shorthand `class` and `id`

[Emmet style](https://docs.emmet.io/abbreviations/syntax/#id-and-class) `class` and `id` attribute shorthands are supported.

```marko
<div#foo.bar.baz/>

// same as
<div id="foo" class="bar baz"/>
```

> [!TIP]
> Interpolations are supported within a dynamic class/id.
>
> ```marko
> <div.icon-${iconName}/>
> ```

### Shorthand `value`

It is common for a tag to use a single input property; therefore Marko allows a shorthand for passing an attribute named `value`. If the attribute name is omitted at the beginning of a tag, it will be passed as `value`.

```marko
<my-tag=1/>

// desugars to

<my-tag value=1/>
```

The [method shorthand](#Shorthand-Methods) can be combined with the value attribute to give us the _value method shorthand_.

```marko
<my-tag() {
  console.log("Hello JavaScript!");
}/>

// desugars to

<my-tag value=function () {
  console.log("Hello JavaScript!");
}/>

// Received by the child as { value() { ... } }
```

### Attribute Termination

Attributes can be terminated with a comma. This is useful in [concise mode](#Concise-Mode).

```marko
<my-tag a=1, b=2/>
```

> [!CAUTION] > [Comma operators / sequence expressions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Comma_operator) must be wrapped in parentheses
>
> ```marko
> <my-tag a=(console.log(foo), foo)/>
> ```

## Tag Content

Markup within a tag is made available as the `content` property of its [`input`](#input).

```marko
<my-tag>Content</my-tag>
```

The implementation of `<my-tag>` above can write out the content by passing its `input.content` to a [dynamic tag](#Dynamic-Tag):

```marko
<div>
  <${input.content}/>
</div>
```

### Text Placeholders

Dynamic text content can be `${interpolated}` in the tag content.
This uses the same syntax as [template literals](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals) in JavaScript.

```marko
<div>
  Hello ${input.name}
</div>
```

> [!NOTE]
> The interpolated value is automatically escaped to avoid XSS.

## Attribute Tags (Named Content)

Tags prefixed with an `@` are called "Attribute Tags" and allow for passing named or repeated [content](#Tag-Content) as additional attributes.

For example, a "layout" tag may need to receive `header` content separetly from its default content. With "Attribute Tags" it is possible to pass these isolated sections of content.

```marko
<my-layout title="Welcome">
  <@header class="foo">
    <h1>Big things are coming!</h1>
  </@header>

  <p>Lorem ipsum...</p>
</my-layout>
```

The attribute tag name (without the leading `@`) becomes a property on the [input](#input) of the parent tag[^1] with the value being an object containing the "attribute tag's" attributes, including the content.

[^1]: Control flow tags such as `<if>` and `<for>` are an exception and allow for [dynamically creating attribute tags](#Dynamic-Attribute-Tags).

In the above `@header` will be made available to `<my-layout>` as `input.header`. The `class` attribute from `@header` becomes `input.header.class` and its content becomes `input.header.content`.

The full [input](todo) object provided to `<my-tag>` in this example would look like:

```js
{
  title: "Welcome",
  header: {
    class: "foo",
    content: [[Content]],
  },
  content: [[Content]],
}
```

The implementation of `my-layout.marko` could look like

```marko
<!doctype html>
<html>
  <head>
    <title>${input.title}</title>
  </head>
  <body>
    <header class=input.header.class>
      <img src="./logo.svg" alt="...">
      <${input.header.content}/>
    </header>

    <main>
      <${input.content}/>
    </main>

    <footer>
      Copywrite ♾️
    </footer>
  </body>
</html>
```

### Nested Attribute tags

Attribute tags may be nested in other attribute tags.

```marko
<my-tag>
  <@a value=1>
    <@b value=2/>
  </>
</>
```

Would provide the following as input

```js
{
  a: {
    value: 2,
    b: { value: 2 }
  }
}
```

### Repeated Attribute Tags

[Attribute Tags](#Attribute-Tags) with the same name can be repeated.

When an attribute tag is repeated, all instances can be consumed using the [iterable protocol](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols#the_iterable_protocol).

```marko
<my-menu>
  <@item value="foo">
    Foo Item
  </@item>

  <@item value="bar">
    Bar Item
  </@item>
</my-menu>
```

The above example uses two `<@item>` tags, but `<my-menu>` receives only a single `item` attribute.

```js
{
  item: {
    value: "foo",
    content: [[Content]],
    [Symbol.iterator]() {/* ... */}
  }
}
```

The other `<@item>`'s can be reached through the iterator. The most comon way to do so is with a [for tag](./custom-tags.md#for) or one of JavaScript's [syntaxes for iterables](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols#syntaxes_expecting_iterables).

```marko
<for|item| of=input.item>
  Value: ${item.value}
  <${item.content}/>
</for>

<div>
  ${[...input.item || []].map(item => item.value)}
</div>
```

> [!TIP]
> If you need repeated attribute tags as a list, it is a common pattern to spread into an array with a [`<const>` tag](./custom-tags.md#const)
>
> ```marko
> <const/items=[...input.items || []]/>
>
> <div>${items.length}</div>
> ```

### Dynamic Attribute Tags

Attribute tags generally are provided directly to their immediate parent. The exception to this is [control flow tags](./core-tags#Control-Flow) which are used to dynamically apply attribute tags.

```marko
<my-message>
  <if=welcome>
    <@title>Hello</>
  </if>
  <else>
    <@title>Good Bye</>
  </else>
</my-message>
```

In this case the `@title` received by `<my-message>` depends on `welcome`.

```marko
<my-select>
  <@option>None</@option>

  <for|opt| of=["a", "b", "c"]>
    <@option>${opt}</>
  </for>
</my-select>
```

Here, `<my-select>` unconditionally receives the first `@option`, and also all of the `@option` tags applied by the `<for>` loop.

> [!NOTE]
> You can't mix [attribute tags](#Attribute-Tags) with default [content](#Tag-Content) while inside a [control flow tag](./custom-tags.md#Control-Flow)

## Tag Variables

Tag variables expose a value from a child tag to be used within a template. These variables are not _quite_ like JavaScript variables, as they are used to power [Marko's compiled reactivity](./reactivity.md).

Tag Variables use a `/` followed by a valid JavaScript [identifier](https://developer.mozilla.org/en-US/docs/Glossary/Identifier) or [destructure assignment pattern](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment) after the tag name.

```marko
<my-tag/foo/>
<my-other-tag/{ bar, baz }/>
```

Native tags have an implicitly returned tag variable that contains a reference to the element.

```marko
<div/myDiv/>
```

In this case `myDiv` will be a variable which can be called to get the `myDiv` element in the browser.

Using the [core `<return>` tag](./core-tags.md#return), any custom tag can return a value into it's parents scope as a tag variable.

### Scope

Tag variables are automatically [hoisted](https://developer.mozilla.org/en-US/docs/Glossary/Hoisting) and can be accessed anywhere in the template except for in [module statements](#Statements). This means that it is possible to read tag variables from anywhere in the tree.

```marko
<form>
  <input/myInput/>
</form>

<script>
  // still available even though it's nested in another tag.
  console.log(myInput())
</script>
```

## Tag Parameters and Arguments

A child may give information to its parent [content](#Tag-Content) using tag parameters.

```marko
// child.marko
<${input.content} number=1337 />

// parent.marko
<child|params|>
  The number is ${params.number}
</child>
```

The `|parameters|` are enclosed in pipes after a tag name, and act functionally like [JavaScript function parameters](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions#function_parameters), within which the first parameter is an object containing all attributes passed from the child component.

> [!TIP]
> Parameters include all features of the [JavaScript function parameters syntax](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions#function_parameters), so feel free to destructure.
>
> ```marko
> <parent|{ number }|>
>   The number is ${number}
> </parent>
> ```

Multiple Tag Parameters can be provided to the content by using the "Tag Arguments" syntax, which follows a JavaScript style `(...args)` syntax after the tag name.

In this case we could have something like

```marko
<${input.content}(1, 2, 3)/>
```

Which the parent would receive as multiple Tag Parameters

```marko
<my-tag|a, b, c|>
  Sum ${a + b + c}
</my-tag>

// spreads work also!
<my-tag|...all|>
  Sum ${all.reduce((a, b) => a + b, 0)}
</my-tag>
```

### Scope

Tag parameters are scoped to the [tag content](#Tag-Content) only.
This means you cannot access the tag parameters outside the body of the tag.

> [!CAUTION] > [Attribute tags](#Attribute-Tags) cannot access the tag parameters of their parent since they are evaluated as attributes.

## Comments

Both [HTML](https://developer.mozilla.org/en-US/docs/Web/HTML/Comments) and [JavaScript](https://developer.mozilla.org/en-US/docs/Web/API/Comment) comments are supported.

```marko
<div>
  <!-- html comments -->
  // JavaScript line comments
  /** JavaScript block comments */
</div>
```

> [!NOTE]
> Comments are ignored completely. To include a literal HTML comment in the output, use the [`<html-comment>` core tag](./core-tags.md#html-comment).

<!-- TODO: should the assets transform move to core? -->
<!-- TODO: we probably want to take the examples from existing body-content docs -->
