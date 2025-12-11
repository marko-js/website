<SYSTEM>This is the reference documentation for the Marko Language & JavaScript Framework</SYSTEM>

----------

<!-- language.md -->

# Language Reference

Marko is a superset of [well-formed](https://en.wikipedia.org/wiki/Well-formed_document) HTML.

The language makes HTML more strict while extending it with control flow and reactive data bindings. It does this by meshing JavaScript syntax features with HTML and introducing a few new syntaxes of its own. Most HTML is valid Marko but there are some important deviations.

## Syntax Legend

<div class="code-block">
<pre class="html html-ts"><code><a href="#statements">import "...";</a>
&lt;<a href="#tags">tag</a>|...<a href="#tag-parameters">params</a>|/<a href="#tag-variables">var</a> ...<a href="#attributes">attrs</a>&gt;
  <a href="#tag-content">content</a> with <a href="#dynamic-text">&#36;{placeholders}</a>
  &lt;<a href="#attribute-tags">@attr-tags</a>/&gt;
&lt;/&gt;</code></pre>
<pre class="concise concise-ts"><code><a href="#statements">import "...";</a>
<a href="#tags">tag</a>|...<a href="#tag-parameters">params</a>|/<a href="#tag-variables">var</a> ...<a href="#attributes">attrs</a>
  -- <a href="#tag-content">content</a> with <a href="#dynamic-text">&#36;{placeholders}</a>
  <a href="#attribute-tags">@attr-tag</a></code></pre>
</div>

> [!NOTE]
> Jump to the section for a syntax by clicking on it.
> The legend is not comprehensive, for more see:
>
> - [`<${dynamic}/>` tag](#dynamic-tags)
> - [Attributes](#attributes) for various attribute shorthands
> - [Tag Arguments](#tag-arguments) as an alternative to attributes
> - [Concise Mode](./concise-syntax.md)

## Template Variables

Within Marko templates a few variables are automatically made available.

### `input`

A JavaScript object globally available in every template that gives access to the [attributes](#attributes) it was provided from a [custom tag](./custom-tag.md) or the data passed in through the [top level api](./template.md).

### `$signal`

An [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) is available in all JavaScript statements, expressions, and blocks in a `.marko` file.

It is aborted when

1. The expression is invalidated
2. The template or [tag content](#tag-content) is removed from the DOM

This is primarily to handle cleaning up side effects.

> [!TIP]
> Many built-in APIs like [`addEventListener()`](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener#signal) include the option to pass a signal for cleanup.
>
> ```marko
> <script>
>   document.addEventListener("resize", () => {
>     // this function will be automatically cleaned up
>   }, { signal: $signal })
> </script>
> ```

### `$global`

Gives access the ["render globals"](./template.md#inputglobal) provided through the [top level api](./template.md).

## Statements

Marko supports a few module scoped top level statements.

### `import`

JavaScript [`import`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import) statements are allowed at the root of the template.

```marko
import sum from "sum"

<div data-number=sum(1, 2)></div>
```

> [!NOTE]
> This syntax is a shorthand for [`static import`](#static). For server and client specific imports, you can use [`server` and `client`](#server-and-client) statements.

#### Tag `import` shorthand

[Custom tags](./custom-tag.md) may be referenced using angle brackets in the `from` of the import, which will use Marko's [custom tag discovery logic](./custom-tag.md).

```marko
import MyTag from "<my-tag>"

<MyTag/>
```

### `export`

JavaScript [`export`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/export) statements are allowed at the root of the template.

```marko
export function getAnswer() {
  return 42;
}

<div>${getAnswer()}</div>
```

### `static`

Statements prefixed with `static` allow running JavaScript expressions in module scope. The statements will run when the template loaded on the server and in the browser.

```marko
static const answer = 41;
static function getAnswer() {
  return answer + 1;
}

<div data-answer=getAnswer()></div>
```

All valid javascript statements are allowed, including functions, declarations, conditions, and blocks.

```marko
static {
  console.log("this will be logged only ONE time");
  console.log("no matter how often the component is used");
  console.log("or how many requests are made to the server");
}
```

### `server` and `client`

As an alternative to [`static`](#static), statements prefixed with `server` or `client` allow arbitrary module scoped JavaScript expressions that are exclusively executed when the template is loaded in a specific environment (the server or the browser).

```marko
server console.log("on the server")

client console.log("in the browser")
```

All valid javascript statements are allowed, including functions, declarations, conditions, and blocks.

```marko
server {
  import { connectToDatabase } from './database';
  const db = connectToDatabase();

  console.log('Database connection established on server');

  // Only happens ONCE, when the application loads
  // and this component is used for the first time
  const users = await db.query('SELECT * FROM users');
  console.log(`Found ${users.length} users in the database`);
}
```

> [!TIP]
> The [`import`](#import) statement is really a shortcut for `static import`. This can be leveraged with `server` and `client` if you want a module to only be imported on one platform
>
> ```marko
> server import "./init-db"
> client import "bootstrap"
> ```

## Tags

Marko supports all native HTML/SVG/whatever tags and attributes. In addition to these, a set of useful [core tags](./core-tags.md) are provided. Each project may have its own [custom tags](./custom-tag.md), and third-party tags may be included through `node_modules`.

All of these types of tags use the same syntax:

```marko
<my-tag/>
```

`.marko` files are [automatically discovered](./custom-tag.md#custom-tag-discovery) as [custom tags](./custom-tag.md) (no need for `import`).

All tags can be [self closed](https://developer.mozilla.org/en-US/docs/Glossary/Void_element#self-closing_tags) when there is no [content](#tag-content). This means `<div/>` is valid, unlike in HTML. Additionally [`void` tags](https://developer.mozilla.org/en-US/docs/Glossary/Void_element) like `<input>` and `<br>` can be [self closed](https://developer.mozilla.org/en-US/docs/Glossary/Void_element#self-closing_tags).

In all closing tags, the tag name may be omitted.

```marko
<div>Hello World</>
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

> [!IMPORTANT]
>
> [ARIA enumerated attributes](https://developer.mozilla.org/en-US/docs/Glossary/Enumerated#aria_enumerated_attributes) use strings instead of booleans, so make sure to pass a string.
>
> ```marko
> // ❌ WRONG: Don't do this
> <button aria-pressed=isPressed />
> // outputs <button aria-pressed=""/>
> ```
>
> ```marko
> // 👍 Correct use of aria attributes
> <button aria-pressed=isPressed && "true" />
> // outputs <button aria-pressed="true"/>
> ```

### Spread Attributes

Attributes may be dynamically included with the [spread](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax#spread_in_object_literals) syntax.

```marko
<my-tag ...input foo="bar"/>
```

In this case `<my-tag>` would receive the attributes as an object like `{ ...input, foo: "bar" }`.

Attributes are merged from left to right, with later spreads overriding earlier ones if there are conflicts.

> [!NOTE]
> The value after the `...` (like [in JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax#spread_in_object_literals)) can be any valid JavaScript expression. This means it can be used to leverage shorthand property names:
>
> ```marko
> <my-tag ...{ property }/>
> ```

### Shorthand Methods

[Method definitions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Method_definitions) allow for a concise way to pass functions as attributes, such as event handlers.

```marko
<button onClick(e) { console.log(e.target) }>Click Me</button>
```

### Shorthand Change Handlers (Two-Way Binding)

The change handler shorthand (`:=`) provides both a value for an attribute and a change handler with the attribute's name suffixed by "Change".

The value must be an [Identifier](https://developer.mozilla.org/en-US/docs/Glossary/Identifier) or a [Property Accessor](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Property_accessors).

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

```marko no-format
<div#foo.bar.baz/>

// same as

<div id="foo" class="bar baz"/>
```

> [!TIP]
> Interpolations are supported within a dynamic class/id.
>
> ```marko no-format
> <div.icon-${iconName}/>
> ```

### Shorthand `value`

It is common for a tag to use a single input property; therefore Marko allows a shorthand for passing an attribute named `value`. If the attribute name is omitted at the beginning of a tag, it will be passed as `value`.

```marko
<my-tag=1/>

// desugars to

<my-tag value=1/>
```

The [method shorthand](#shorthand-methods) can be combined with the value attribute to give us the _value method shorthand_.

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

Attributes can be terminated with a comma. This is useful in [concise mode](./concise-syntax.md#attributes-on-multiple-lines).

```marko
<my-tag a=1, b=2/>
```

> [!CAUTION]
> Sequence expressions with [comma operators](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Comma_operator) must be wrapped in parentheses
>
> ```marko
> <my-tag a=(console.log(foo), foo)/>
> ```

## Tag Content

Markup within the body of a tag is made available as the `content` property of its [`input`](#input).

```marko
<my-tag>Content</my-tag>
```

The implementation of `<my-tag>` above can write out the content by passing its `input.content` to a [dynamic tag](#dynamic-tags):

```marko
export interface Input {
  content: Marko.Body;
}

<div>
  <${input.content}/>
</div>
```

### Dynamic Text

Dynamic text content can be `${interpolated}` in the tag content. This uses the same syntax as [template literals](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals) in JavaScript.

```marko
export interface Input {
  name: string;
}

<div>
  Hello ${input.name}
</div>
```

> [!NOTE]
> The interpolated value is automatically escaped to avoid [XSS](https://developer.mozilla.org/en-US/docs/Web/Security/Attacks/XSS).

## Attribute Tags

Tags prefixed with an `@` are not rendered, but instead passed alongside attributes in [`input`](./language.md#input). Attribute tags allow for passing named or repeated [content](#tag-content) as additional attributes.

```marko
<my-layout title="Welcome">
  <@header class="foo">
    <h1>Big things are coming!</h1>
  </@header>

  <p>Lorem ipsum...</p>
</my-layout>
```

Here, `@header` is available to `<my-layout>` as `input.header`. The `class` attribute from `@header` is in `input.header.class` and its content is in `input.header.content`.

The full [input](./language.md#input) object provided to `<my-tag>` in this example would look like:

```js
// a representation of `input` received by `my-layout.marko` (from the previous code snippet)
{
  title: "Welcome",
  header: {
    class: "foo",
    content: /* <h1>Big things are coming!</h1> */,
  },
  content: /* <p>Lorem ipsum...</p> */,
}
```

The implementation of `my-layout.marko` might look like

```marko
export interface Input {
  title: string;
  header: Marko.AttrTag<{
    class: string;
    content: Marko.Body;
  }>;
  content: Marko.Body;
}

<!doctype html>
<html>
  <head>
    <title>${input.title}</title>
  </head>
  <body>
    <header
      // use the class from `@header`
      class=input.header.class
    >
      <img src="./logo.svg" alt="...">
      // render the content of `@header`
      <${input.header.content}/>
    </header>

    <main>
      // render the main tag content
      <${input.content}/>
    </main>

    <footer>
      Copyright ♾️
    </footer>
  </body>
</html>
```

> [!NOTE]
> Control flow tags ([`<if>`](./core-tag.md#if--else) and [`<for>`](./core-tag.md#for)) cannot contain attribute tags themselves, and instead are used for [dynamically creating attribute tags](#conditional-attribute-tags).

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

When multiple attribute tags share a name, all instances may be consumed using the [iterable protocol](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols#the_iterable_protocol).

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

This example uses two `<@item>` tags, but `<my-menu>` receives only a single `item` attribute.

```js
{
  item: {
    value: "foo",
    content: /* Foo Item */,
    [Symbol.iterator]() {
      // Not the exact implementation, but essentially this is what the function contains
      yield* [
        { value: "foo", content: /* Foo Item */ },
        { value: "bar", content: /* Bar Item */ }
      ];
    }
  }
}
```

The other `<@item>` tags are reached through the iterator. The most common way to do so is with a [for tag](./core-tag.md#for) or one of JavaScript's [syntaxes for iterables](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols#syntaxes_expecting_iterables).

```marko
/* my-menu.marko */
export interface Input {
  item?: Marko.AttrTag<{
    value: string;
    content: Marko.Body;
  }>;
}

<for|item| of=input.item>
  Value: ${item.value}
  <${item.content}/>
</for>
```

Attribute tags are generally singular by name, even when repeated. Prefer singular property names when consuming repeated attribute tags (for example, iterate `input.item` rather than `input.items`).

> [!TIP]
> If you need repeated attribute tags as a list, it is a common pattern to spread into an array with a [`<const>` tag](./core-tag.md#const)
>
> ```marko
> export interface Input {
>   item?: Marko.AttrTag<{}>;
> }
>
> <const/items=[...input.item || []]>
>
> <div>${items.length}</div>
> ```

### Conditional Attribute Tags

Attribute tags are generally provided directly to their immediate parent. The exception to this is control flow tags ([`<if>`](./core-tag.md#if--else) and [`<for>`](./core-tag.md#for)), which are used to dynamically apply attribute tags.

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

In this case, the `@title` received by `<my-message>` depends on `welcome`.

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
> You can't mix [attribute tags](#attribute-tags) with default [content](#tag-content) while inside a [control flow tag](./core-tag.md#if--else).

## Tag Variables

Tag variables expose a value from a tag to be used within a template (from a custom tag, the variable is taken from its [`<return>`](./core-tag.md#return)). These variables are not _quite_ like JavaScript variables, as they are used to power [Marko's compiled reactivity](./reactivity.md).

Tag Variables use a `/` followed by a valid JavaScript [identifier](https://developer.mozilla.org/en-US/docs/Glossary/Identifier) or [destructure assignment pattern](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment) after the tag name.

```marko
<my-tag/foo/>
<my-other-tag/{ bar, baz }/>

<div>`my-tag` returned ${foo}</div>
<div>`my-other-tag` returned an object containing ${bar} and ${baz}</div>
```

Native tags have an implicitly returned tag variable that contains a reference to the element.

```marko
<div/myDiv/>

<script>
  myDiv().innerHTML = "Hello";
</script>
```

In this case `myDiv` will be a variable which can be called to get the `myDiv` element in the browser.

Using the [core `<return>` tag](./core-tag.md#return), any custom tag can return a value into it's parents scope as a tag variable.

### Scope

Tag variables are automatically [hoisted](https://developer.mozilla.org/en-US/docs/Glossary/Hoisting) and can be accessed anywhere in the template except for in [module statements](#statements). This means that it is possible to read tag variables from anywhere in the tree.

```marko
<form>
  <input/myInput/>
</form>

<script>
  // still available even though it's nested in another tag.
  console.log(myInput())
</script>
```

## Tag Parameters

While rendering [content](#tag-content), child may pass information _back_ to its parent using tag parameters.

```marko
/* child.marko */
export interface Input {
  content: Marko.Body<[{ number: number }]>;
}

<div>
  <${input.content} number=1337 />
</div>
```

```marko
/* parent.marko */
<child|params|>
  Rendered with ${params.number} as the `number=` attribute.
</child>
```

This example results in the following HTML:

```html
<div>Rendered with 1337 as the `number=` attribute</div>
```

The `|parameters|` are enclosed in pipes after a tag name, and act functionally like [JavaScript function parameters](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions#function_parameters) within which the first parameter is an object containing all attributes passed from the child component.

> [!TIP]
> Parameters include all features of the [JavaScript function parameters syntax](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions#function_parameters), so feel free to destructure.
>
> ```marko
> <child|{ number }|>
>   Rendered with ${number} as the `number=` attribute.
> </child>
> ```

### Tag Arguments

Multiple [tag parameters](#tag-parameters) may be provided to the content by using the Tag Arguments syntax, which uses the JavaScript `(...args)` syntax after the tag name.

```marko
export interface Input {
  content: Marko.Body<[number, number, number]>;
}

<${input.content}(1, 2, 3)/>
```

This example passes three arguments back to its parent.

```marko
<my-tag|a, b, c|>
  Sum ${a + b + c}
</my-tag>

// spreads work also!
<my-tag|...all|>
  Sum ${all.reduce((a, b) => a + b, 0)}
</my-tag>
```

> [!WARNING]
> Tag content may use attributes _or_ arguments, but not both at once.
>
> ```marko
> <my-tag a=1 b=2 c=3 />
> // identical to
> <my-tag({ a: 1, b: 2, c: 3 })/>
> ```

### Scope

Tag parameters are scoped to the [tag content](#tag-content) only.
This means you cannot access the tag parameters outside the body of the tag.

> [!CAUTION]
> Tag parameters cannot be accessed by [attribute tags](#attribute-tags) since they are evaluated as attributes.

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
> Comments are ignored completely. To include a literal HTML comment in the output, use the [`<html-comment>` core tag](./core-tag.md#html-comment).

## Dynamic Tags

In place of the tag name, an `${interpolation}` may be used to dynamically output a [native tag](./native-tag.md), [custom tag](./custom-tag.md), or [tag content](#tag-content).

With a dynamic tag the closing tag should be `</>`, or if there is no [content](#tag-content) the tag may be self-closed.

### Dynamic Native Tags

When the value of the dynamic tag name is a string,

```marko
export interface Input {
  headingSize: 1 | 2 | 3 | 4 | 5 | 6;
}

// Dynamically output a native tag.
<${"h" + input.headingSize}>Hello!</>
```

### Dynamic Custom Tags

```marko
// Dynamically output a custom tag.
import MyTagA from "<my-tag-a>"
import MyTagB from "<my-tag-b>"
<${Math.random() > 0.5 ? MyTagA : MyTagB}/>
```

> [!CAUTION]
> Strings will _always_ render native tags. When rendering a custom tag, you must have a reference to it. The following is _not_ equivalent to the above example, since Marko would output a native HTML element (as if you called `document.createElement("my-tag-a")`).
>
> ```marko
> <${Math.random() > 0.5 ? "my-tag-a" : "my-tag-b"}/>
> ```

> [!NOTE]
> If an object is provided with a `content` property, the `content` value will become the dynamic tag name. This is how the [define](./core-tag.md#define) tag works under the hood 🤯.
>
> ```marko
> <define/message>
>   Hello World
> </define>
> <${message}/>
> ```
>
> Although in this case you should prefer a [PascalCase](#pascalcase-variables) `<Message>` tag instead.

### Conditional Parent Tags

When a dynamic tag name is [falsy](https://developer.mozilla.org/en-US/docs/Glossary/Falsy) it will output the tag's [content](#tag-content) only. This is useful for conditional parenting and fallback content.

```marko
export interface Input {
  href: string;
}

// Only wrap the text with an anchor when we have an `input.href`.
<${input.href && "a"} href=input.href>Hello World</>
```

### PascalCase Variables

Local variable names that start with an upper case letter (`PascalCase`) can also be used as tag names without the explicit dynamic tag syntax. This is useful for referencing an imported custom tag or with the [`<define>` tag](./core-tag.md#define).

```marko
import MyTag from "./my-tag.marko"

<MyTag/>
```

This is equivalent to

```marko
import MyTag from "./my-tag.marko"

<${MyTag}/>
```


----------

<!-- custom-tag.md -->

# Custom Tag Discovery

Custom Tags in Marko allow for reusing markup across the application.

## Priority

When you use a `<Tag>` in Marko it is resolved in the following order:

- [Local Variable Custom Tags](#local-variable-custom-tags) <!-- this isn't a table of contents, prettier 😠 -->
- [Relative Custom Tags](#relative-custom-tags)
- [Installed Custom Tags](#installed-custom-tags)
- [Supporting Files](#supporting-files)

## Local Variable Custom Tags

If a tag name starts with an uppercase letter, Marko first checks for a local variable with the same name.

This is useful for importing custom tags that can't be [discovered automatically](#relative-custom-tags).

```marko
import MyTag from "./my-tag.marko"

<MyTag/>
```

or when using the [`<define>` tag](./core-tag.md#define)

```marko
<define/MyTag|input: { name: string }| foo=1>
  <span>Hello ${input.name}</span>
</>

<MyTag name="HTML"/>
<MyTag name="Marko"/>
```

> [!NOTE]
> If you need to reference a local variable that is _not_ `PascalCase`, you can do so using a [dynamic tag](./language.md#dynamic-tags).
>
> ```marko
> import { camelCaseTag } from "somewhere"
>
> <${camelCaseTag} />
> ```

## Relative Custom Tags

If Marko did not resolve a [local variable tag name](#local-variable-custom-tags) it checks the file system. From the current file, it looks recursively upward for:

- `tags/TAG_NAME.marko`
- `tags/TAG_NAME/index.marko`
- `tags/TAG_NAME/TAG_NAME.marko`

Let's take a look at an example directory structure to understand this better:

```
tags/
    app-header.marko
    app-footer.marko
pages/
    about/
        tags/
            team-members.marko
        page.marko
    home/
        tags/
            home-banner.marko
        page.marko
```

The file `pages/home/page.marko` can resolve:

- `<app-header>`
- `<app-footer>`
- `<home-banner>`

And the file `pages/about/page.marko` can resolve:

- `<app-header>`
- `<app-footer>`
- `<team-members>`

The `home` page can't resolve `<team-members>` and the `about` page can't resolve `<home-banner>`. By using nested `tags/` directories, we've scoped our page-specific tags to their respective pages.

> [!NOTE]
> In previous versions, relative tags were discovered in `components/` directories instead of `tags/`. These directories are now used as a heuristic for [runtime interoperability](../guide/marko-5-interop.md).

## Installed Custom Tags

If no Local Variable or Relative Custom Tag is found, Marko checks installed tag libraries in your `node_modules`.

Packages that provide Marko Custom Tags must include a `marko.json` at the root which tells Marko where the exported tags are.

```json
/* marko.json */
{
  "exports": "./dist/tags"
}
```

This example file tells Marko to expose all Custom Tags directly under the `dist/tags/` directory to the application using your package.

> [!TIP]
> Often a tag library will have "private tags" and "exported tags". A common way to achieve this is to have a `tags/` folder _within_ the exported `tags/` folder 🤯.
>
> For example, when exporting `dist/tags`, `dist/tags/tags/` could contain private components only available _within_ the library.

> [!CAUTION]
> If two packages export the tag name, Marko will choose the one it finds first. To prevent collisions, tag libraries are encouraged to prefix all exported tag names, e.g. `ebay-`. If you must use tags with conflicting names, you can import by path to disambiguate.

## Supporting Files

Marko discovers [`style`](./styling.md) and `marko-tag.json` files adjacent to the `.marko` file.

```
foo.marko
foo.style.css
foo.marko-tag.json
```

Here, the `<foo>` tag has associated styles and metadata.

When the file is named `index.marko` the prefix is optional.

```
tags/
  bar/
    index.marko
    style.css
  baz/
    index.marko
    marko-tag.json
```

Here, the `<bar>` tag has an associated `style.css` and the `<baz>` tag has an associated `marko-tag.json`.

For `style` files any extension may be used allowing for CSS preprocessors.

```
tags/
  less/
    index.marko
    style.less
  scss/
    index.marko
    style.scss
```


----------

<!-- reactivity.md -->

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

> [!TIP]
> Marko is a **compiled language**, and its reactive graph is discovered at compile time instead of during runtime. This is in contrast with many of the other leading approaches, such as [Signals in SolidJS](https://docs.solidjs.com/advanced-concepts/fine-grained-reactivity) and [Hooks in React](https://react.dev/reference/react/hooks).

## Scheduling Updates

Marko automatically batches work to ensure optimal performance. Any time a [reactive variable](#reactive-variables) is changed, its update is queued to ensure that multiple changes will be applied efficiently together.

This update queue is typically scheduled after a [microtask](https://developer.mozilla.org/en-US/docs/Web/API/HTML_DOM_API/Microtask_guide).

If additional updates are scheduled after the queue is consumed but _before the update is painted_, they are deferred until the next frame. This accomplishes a few things:

- Content ready to display to the user is not blocked.
- It is not possible to lock up the application in an infinite update loop.
- The update loop can be used to power animations (although CSS [Animations](https://developer.mozilla.org/en-US/docs/Web/CSS/animation) & [Transitions](https://developer.mozilla.org/en-US/docs/Web/CSS/transition)/ JS [Web Animations API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API) are preferred in most cases).


----------

<!-- core-tag.md -->

# Core Tags

## `<if>` / `<else>`

The `<if>` and `<else>` control flow tags are used to conditionally display content or apply [attribute tags](./language.md#attribute-tags).

An `<if>` is applied when its `value=` attribute ([shorthand used below](./language.md#shorthand-value)) is [truthy](https://developer.mozilla.org/en-US/docs/Glossary/Truthy) and may be followed by an `<else>`.

The `<else>` tag may have its own condition as an `if=` attribute.
When it has a condition, the condition is checked before the `<else>` is applied and another `<else>` may follow.

Expressions in the if/else chain are evaluated in order.

```marko
<if=EXPRESSION>
  Body A
</if>
<else if=ANOTHER_EXPRESSION>
  Body B
</else>
<else>
  Body C
</else>
```

## `<for>`

The `<for>` control flow tag allows for writing content or applying [attribute tags](./language.md#attribute-tags) while iterating. Its [content](./language.md#tag-content) has access to information about each iteration through the [Tag Parameters](./language.md#tag-parameters).

The `<for>` tag can iterate over:

- Arrays and [Iterables](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols#the_iterable_protocol) with the `of=` attribute

  ```marko
  <for|item, index| of=["a", "b", "c"]>
    ${index}: ${item}
  </for>
  ```

- Object properties and values with the `in=` attribute

  ```marko
  <for|key, value| in={a: 1, b: 2, c: 3}>
    ${key}: ${value}
  </for>
  ```

- **Exclusive** ranges of numbers with the `until=`, `from=`, and `step=` attributes

  ```marko
  <for|num| until=5>${num}</for>
  // 0 1 2 3 4

  <for|num| from=3 until=7>${num}</for>
  // 3 4 5 6

  <for|num| from=2 until=10 step=2>${num}</for>
  // 2 4 6 8
  ```

- **Inclusive** ranges of numbers with the `to=`, `from=`, and `step=` attributes

  ```marko
  <for|num| to=5>${num}</for>
  // 0 1 2 3 4 5

  <for|num| from=3 to=7>${num}</for>
  // 3 4 5 6 7

  <for|num| from=2 to=10 step=2>${num}</for>
  // 2 4 6 8 10
  ```

The `<for>` tag has a `by=` attribute which helps preserve state while reordering content within the loop. The value should be a function (which receives the same parameters as the loop itself) that is used to give each iteration a unique key.

```marko
<for|user| of=users by=user => user.id>
  ${user.firstName} ${user.lastName}
</for>
```

The `by=` attribute above keys each iteration by its `user.id` property.

Additionally, when using the `of=` attribute, `by=` may be a string. This will key the items by the corresponding property on each item.

This means the previous example can simplified to:

```marko
<for|user| of=users by="id">
  ${user.firstName} ${user.lastName}
</for>
```

## `<let>`

The `<let>` tag introduces mutable state through its [Tag Variable](./language.md#tag-variables).

```marko
<let/x=1>
```

The `value=` attribute (usually with a [shorthand](./language.md#shorthand-value)) provides an initial value for its state.

When a tag variable is updated, everywhere it is used also re-runs. This is the core of Marko's reactive system.

```marko
<let/count=1>

<button onClick() { count++ }>
  Current count: ${count}
</button>
```

In this template, `count` is incremented when the button is clicked. Since `count` is a [Tag Variable](./language.md#tag-variables), it will cause any downstream expression (in this case the text in the button) to be updated every time it changes.

> [!NOTE]
> The `<let>` tag is not reactive to changes in its `value=` attribute unless it is [controllable](#controllable-let). Its tag variable updates only through direct assignment or its change handler.
>
> ```marko
> export interface Input {
>   initialCount: number;
> }
>
> <let/count=input.initialCount>
> <p>Count: ${count}</p>
> <p>Input Count: ${input.initialCount}</p>
> ```
>
> Here, even if `input.initialCount` changes, `count` remains at its initial value.

### Controllable Let

The `<let>` tag can be made **controllable** using its `valueChange=` attribute, similarly to [native tag change handlers](./native-tag.md#change-handlers). This enables interception and transformation of state changes, or synchronization of state between parent and child components.

```marko
<let/value="HELLO">
<let/controlled_value=value valueChange(newValue) { value = newValue.toUpperCase() }>
```

In this example:

1. `value` holds the base state with an initial value of "HELLO"
2. `controlled_value` reflects the value of `value`, but its `valueChange` handler ensures all updates are uppercase
3. Any changes to `controlled_value` are intercepted, transformed to uppercase, and stored in `value`

A more common use case is creating state that can be optionally controlled by a parent component:

```marko
/* counter.marko */
export interface Input {
  count: number;
  countChange?: (count: number) => void;
}

<let/count:=input.count>

<button onClick() { count++ }>
  Clicked ${count} times
</button>
```

This creates two possible behaviors:

1. **Uncontrolled**: If the parent only provides `count=`, the child maintains its own state:

   ```marko
   <counter count=0/>
   ```

2. **Controlled**: If the parent provides both `count=` and `countChange=`, the parent takes control of the state:

   ```marko
   <let/count=0>
   <counter count:=count/>
   <button onClick() { count = 0 }>
     Reset
   </button>
   ```

## `<const>`

The `<const>` exposes its `value=` attribute (usually with a [shorthand](./language.md#shorthand-value)) through its [Tag Variable](./language.md#tag-variables).

Extending the [`<let>`](#let) example we could derive data from the `count` state like so:

```marko
<let/count=1>
<const/doubleCount=count * 2>

<button onClick() { count++ }>
  Current count: ${count}
  And the double is ${doubleCount}
</button>
```

> [!NOTE]
> The `<const>` tag is locally scoped and will be initialized for every instance of a component. If your goal is to expose a program wide constant, you should use [`static const`](./language.md#static) instead.

> [!TIP]
> The implementation of the [`<const>`](#const) tag is conceptually identical to [`<return>`](#return)ing its `input.value`. 🤯
>
> ```marko
> /* const.marko */
> export interface Input<T> {
>   value: T;
> }
>
> <return=input.value>
> ```

## `<return>`

The `<return>` tag allows any [custom tag](./custom-tag.md) to expose a [Tag Variable](./language.md#tag-variables).

The `value=` attribute (usually expressed via the [shorthand](./language.md#shorthand-value)) is made available as the tag variable of the template.

```marko
/* answer.marko */
<return=42>
```

The return value may then be used in the parent template:

```marko
<answer/value/>

<div>${value}</div>
```

### Assignable Return Value

By default, an exposed variable can not be assigned a value. Value assignment may be enabled with the `valueChange=` attribute on the `<return>`.

If a `valueChange=` attribute is provided, it is called whenever the tag variable is assigned a value.

```marko
/* uppercase.marko */
export interface Input {
  value: string;
}

<let/value = input.value.toUpperCase()>

<return=value valueChange(newValue) {
  value = newValue.toUpperCase();
}/>
```

In the above example, the exposed tag variable is initialized to an UPPERCASE version of `input.value` and when new values are assigned it will first UPPERCASE the value before storing it in state.

```marko
<uppercase/value=""/>
<input onInput(e) { value = e.target.value }/>
<div>${value}</div> // value is always uppercased
```

## `<script>`

The `<script>` tag has special behavior in Marko.

The content of a `<script>` tag is executed first when the template has finished rendering and is mounted in the browser.
It will also be executed _again_ after any [Tag Variable](./language.md#tag-variables) or [Tag Parameter](./language.md#tag-parameters) it references has changed.

```marko
<let/count=1>
<button/myButton onClick() { count++ }>
  Current count: ${count}
</button>

<script>
  // Runs in the browser for each instance of this tag.
  // Also runs when either `myButton` or `count` updates
  console.log("clicked", myButton(), count, "times");
</script>
```

Often the `<script>` tag is coupled with the [`$signal` api](./language.md#signal) to apply some side effect, and cleanup afterward.

```marko
<script>
  const intervalId = setInterval(() => {
    console.log("time", Date.now());
  }, 1000);

  $signal.onabort = () => clearInterval(intervalId);
</script>
```

> [!TIP]
> There are very few cases where you should be using a _real_ `<script>` tag, but if you absolutely need it you can use the [`<html-script>`](#html-script--html-style) fallback.

## `<style>`

The `<style>` tag has special behavior in Marko. No matter how many times a component renders, its styles are only loaded once.

```marko
<style>
  /* Bundled and loaded once */
  body {
    color: green;
  }
</style>
```

The `<style>` may include a file extension to enable css preprocessors such as [scss](https://sass-lang.com/documentation/syntax/#scss) and [less](https://lesscss.org/).

```marko
<style.scss>
  $primary-color: green;

  .fancy-scss {
    color: $primary-color;
  }
</style>

<div class="fancy-scss">Hello!</div>

<style.less>
  @primary-color: blue;

  .fancy-less {
    color: @primary-color;
  }
</style>

<div class="fancy-less">Hello!</div>
```

If the `<style>` tag has a [Tag Variable](./language.md#tag-variables), it leverages [CSS Modules](https://github.com/css-modules/css-modules) to expose its classes as an object.

```marko
<style/styles>
  .foo { border: 1px solid red }
  .bar { color: green }
</style>

<div class=styles.foo />
<div class=[styles.foo, styles.bar] />
<div class={ [styles.bar]: true } />
<div.${styles.foo} />
```

> [!TIP]
> There are very few cases where you should be using a _real_ inline `<style>` tag but if needed you can use the fallback [`<html-style>`](#html-script--html-style) tag.

## `<define>`

The `<define>` tag is primarily used to create reusable snippets of markup that can be shared across the template.

```marko
<define/MyTag|input: { name: string }| foo=1>
  <span>Hello ${input.name}</span>
</>

<MyTag name="HTML"/>
<MyTag name="Marko"/>

<div>${MyTag.foo}</div>
```

The [Tag Variable](./language.md#tag-variables) reflects the attributes the `<define>` tag was provided (including the [content](./language.md#tag-content)).

> [!TIP]
> The implementation of the `<define>` tag above is conceptually identical to [`<return>`](#return)ing its `input`. 🤯
>
> ```marko
> /* define.marko */
> export type Input<T> = T;
> <return=input>
> ```

## `<lifecycle>`

The `<lifecycle>` tag is used to synchronize side-effects from imperative client APIs.

```marko
<lifecycle
  onMount() {
    // Called once this tag is attached to the dom, and never again.
  }
  onUpdate() {
    // Called every time the dependencies of the `onUpdate` function are invalidated.
  }
  onDestroy() {
    // Called once this tag is removed from the dom.
  }
/>
```

The `this` is consistent across the lifetime of the `<lifecycle>` tag and can be mutated.

```marko
client import { WorldMap } from "world-map-api";

<let/latitude = 0>
<let/longitude = 0>
<div/container/>
<lifecycle<{ map: WorldMap }>
  onMount() {
    this.map = new WorldMap(container(), { latitude, longitude, zoom });
  }
  onUpdate() {
    this.map.setCoords(latitude, longitude);
    this.map.setZoom(zoom);
  }
  onDestroy() {
    this.map.destroy();
  }
/>
```

> [!TIP]
> All attributes on the `<lifecycle>` tag attributes available as the `this` in any of the event handler attributes.

## `<id>`

The `<id>` tag exposes a [Tag Variable](./language.md#tag-variables) with a short unique id string (compatible with [`id=` and aria attributes](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/id)).

```marko
<id/cheeseId/>
<label for=cheeseId>Do you like cheese?</label>
<input id=cheeseId type="checkbox" name="cheese">
```

If the `value=` attribute contains a non-nullable value, it will be used instead of the generated one.

```marko
/* textbox.marko */
export interface Input {
  id?: string;
  description: string;
}

<id/id=input.id>

<input aria-describedby=id>
<span id=id>${description}</span>
```

## `<log>`

The `<log>` tag performs a [console.log](https://developer.mozilla.org/en-US/docs/Web/API/console/log_static) of its `value=` attribute (shown here using [the shorthand](./language.md#shorthand-value)).

The log is re-executed each time its tag variable updates.

```marko
<let/count=0>
<log=`Current count: ${count}`>
<button onClick() { count++ }>Log</button>
```

This logs `Current count: 0` on both server and client and again whenever `count` changes.

## `<debug>`

The `<debug>` tag injects a [`debugger` statement](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/debugger) within the template that will be executed once the tag renders.

```marko
export interface Input {
  stuff: any;
}

<const/{ stuff } = input>

<debug/> // Can be useful to inspect render-scoped variables with a debugger.
```

If a `value=` attribute is included, the debugger will be executed whenever it changes.

```marko
export interface Input {
  firstName: string;
  lastName: string;
}

<debug=[input.firstName, input.lastName]>
```

This debugger executes on the initial render and whenever `input.firstName` or `input.lastName` changes.

## `<await>`

The `<await>` tag unwraps the promise in its [`value=` attribute](./language.md#shorthand-value) and exposes it through a [tag parameter](./language.md#tag-parameters).

```marko
<await|user|=getUser()>
  <img src=user.avatar>
  ${user.name}
</await>
```

If this tag has a [`<try>`](#try) ancestor with a [`@placeholder`](#placeholder), the placeholder content is shown while the promise is pending.

```marko
<try>
  <div>
    <await|user|=getUser()>
      ${user.name}
    </await>
  </div>

  <@placeholder>
    Loading...
  </@placeholder>

  <@catch|err|>
    ${err.message}
  </@catch>
</try>
```

## `<try>`

The `<try>` tag is used for catching runtime errors and managing asynchronous boundaries. It has two optional [attribute tags](./language.md#attribute-tags): `@catch` and `@placeholder`.

### `@catch`

When a runtime error occurs in the [content](./language.md#tag-content) of the `<try>` or its `@placeholder` attribute tag, the content is replaced with the content of the `@catch` attribute tag. The thrown `error` is made available as the [tag parameter](./language.md#tag-parameters) of the `@catch`.

```marko
<try>
  <const/foo = { bar: { baz: 1 } }>
  ${foo.baz.bar} // 💥 boom! 👇

  <@catch|err|>
    ${err.message} // "Cannot read property `bar` of undefined"
  </@catch>
</try>
```

### `@placeholder`

The [content](./language.md#tag-content) of the `@placeholder` [attribute tag](./language.md#attribute-tags) will be displayed while an [`<await>` tag](#await) is pending inside of the content of the `<try>`.

## `<html-comment>`

By default, [html comments](./language.md#Comments) are stripped from the output. The `<html-comment>` tag is used to output a literal `<!-- comment -->`.

```marko
<html-comment>Hello, view source</html-comment>
```

This tag also exposes a [tag variable](./language.md#tag-variables) which contains a getter to the reference of the [comment node](https://developer.mozilla.org/en-US/docs/Web/API/Comment) in the DOM.

```marko
<html-comment/commentNode/>

<return() {
  return commentNode().parentNode.getBoundingClientRect()
}/>
```

## `<html-script>` & `<html-style>`

The [`<script>`](./native-tag.md#script) and [`<style>`](./native-tag.md#style) tags are enhanced to enable best practices and help developers avoid common footguns.

Though not typically needed, vanilla versions of these tags may be written via the `<html-script>` and `<html-style>` tags respectively.

> [!CAUTION]
> The `<html-*>` tags are only used for specialized use cases, and should _almost never_ be used over [`<script>`](./native-tag.md#script) or [`<style>`](./native-tag.md#style).

```marko
// Literally written out as a `<script>` html tag.
<html-script type="importmap">
  { "imports": { "square": "./module/shapes/square.js" } }
</html-script>

// Literally written out as a `<style>` html tag.
<html-style>
  @import url('https://fonts.googleapis.com/css2?family=Ubuntu&display=swap');
</html-style>
```


----------

<!-- native-tag.md -->

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

```marko
<let/selected="en">
<select value:=selected>
  <option value="en">English</option>
  <option value="pt-br">Portuguese (Brazil)</option>
  <option value="it">Italian</option>
</select>
```

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


----------

<!-- typescript.md -->

# TypeScript

Marko’s TypeScript support offers in-editor error checking, makes refactoring less scary, verifies that data matches expectations, and even helps with API design.

## Enabling TypeScript in your Marko project

There are two (non-exclusive) ways to add TypeScript to a Marko project:

- **For sites and web apps**, [a `tsconfig.json` file](https://www.typescriptlang.org/docs/handbook/tsconfig-json.html) at the project root is the only requirement:

  ```
  src/
  package.json
  tsconfig.json
  ```

- **For [packages of Marko tags](https://markojs.com/docs/custom-tags/#publishing-tags-to-npm)**, the `"script-lang"` attribute must be set to `"ts"` in [the `marko.json`](./marko-json.md):

  ```json
  /* marko.json */
  {
    "script-lang": "ts"
  }
  ```

  This will automatically expose type-checking and autocomplete for the published tags.

> [!TIP]
> You can also use the `script-lang` method for sites and apps.
>
> Marko will crawl up the directory looking for a `marko.json` with `script-lang` defined.
>
> This helps when incrementally migrating to TypeScript allowing folders to opt-in or opt-out of strict type checking.

## Typing `input`

A `.marko` file will use any exported `Input` type for [that file’s `input` object](./language.md#input).

This can be `export type Input` or `export interface Input`.

### Example

```marko
/* PriceField.marko */
export interface Input {
  currency: string;
  amount: number;
}

<label>
  Price in ${input.currency}:
  <input type="number" value=input.amount min=0 step=0.01>
</label>
```

Since it is exported, `Input` may be accessed from other `.marko` and `.ts` files:

```marko
import { Input as PriceInput } from "<PriceField>";
import { ExtraTypes } from "lib/utils.ts";
export type Input = PriceInput & ExtraTypes;
```

```marko
import { Input as PriceInput } from "<PriceField>";
export interface Input extends PriceInput {
  discounted: boolean;
  expiresAt: Date;
};
```

### Generic `Input`

[Generic Types and Type Parameters](https://www.typescriptlang.org/docs/handbook/2/generics.html) on `Input` are recognized throughout the entire `.marko` template (excluding [static statements](./language.md#static)).

```marko
export interface Input<T> {
  options: T[];
  onSelect: (newVal: T) => unknown;
}

static function staticFn() {
  // can NOT use `T` here
}

<const/instanceFn(val: T) {
  // can use `T` here
}/>

// can use `as T` here
<select onInput(evt) { input.onSelect(options[evt.target.value] as T) }>
  <for|value, i| of=input.options>
    <option value=i>${value}</option>
  </for>
</select>
```

## Built-in Marko Types

Marko exposes common [type definitions](https://github.com/marko-js/marko/blob/main/packages/marko/index.d.ts) through the `Marko` [TypeScript namespace](https://www.typescriptlang.org/docs/handbook/namespaces.html):

- **`Marko.Template<Input, Return>`**
  - The type of a `.marko` file
  - `typeof import("./template.marko")`
- **`Marko.TemplateInput<Input>`**
  - The object accepted by the render methods of a template. It includes the template's `Input` and `$global` values.
- **`Marko.Body<Params, Return>`**
  - Used to type [tag content](./language.md#tag-content)
- **`Marko.Renderable`**
  - All values accepted by the [`<${dynamic}/>` tag](./language.md#dynamic-tags)
  - `string | Marko.Template | Marko.Body | { content: Marko.Body}`
- **`Marko.Global`**
  - The type of [the `$global` object](./language.md#global)
- **`Marko.RenderResult`**
  - The result of [rendering a Marko template](./template.md#templaterenderinput)
  - `ReturnType<template.renderSync>`
  - `Awaited<ReturnType<template.render>>`
- **`Marko.NativeTags`**
  - `Marko.NativeTags`: An object containing all [native tags](./native-tag.md) and their types
- **`Marko.Input<TagName>`** and **`Marko.Return<TagName>`**
  - Helpers to extract the input and return types from native tags (when a string is passed) or custom tags.
- **`Marko.BodyParameters<Body>`** and **`Marko.BodyReturnType<Body>`**
  - Helper to extract the parameters and return types from a `Marko.Body`
- **`Marko.AttrTag<T>`**
  - Used to represent types for [attributes tags](./language.md#attribute-tags)
  - A single attribute tag, with a `[Symbol.iterator]` to consume any repeated tags

### Deprecated

- **`Marko.Component<Input, State>`**
  - The base class for a [class component](https://markojs.com/v5/docs/class-components/#class-components)
- **`Marko.Out`**
  - The render context with methods like `write`, `beginAsync`, etc.
  - `ReturnType<template.render>`
- **`Marko.Emitter`**
  - `EventEmitter` from `@types/node`

### Typing `content`

A commonly used type from the `Marko` namespace is `Marko.Body` which can be used to type the [content](./language.md#tag-content) in `input.content`:

```marko
/* child.marko */
export interface Input {
  content?: Marko.Body;
}
```

Here, all of the following are acceptable:

```marko
/* index.marko */
<child/>
<child>Text in render body</child>
<child>
  <div>Any combination of components</div>
</child>
```

Passing other values (including components) causes a type error:

```marko
/* index.marko */
import OtherTag from "<other-tag>";
<child content=OtherTag/>
```

#### Typing Tag Parameters

Tag parameters are provided to the `content` by the child tag. For this reason, `Marko.Body` allows typing of its parameters:

```marko
/* for-by-two.marko */
export interface Input {
  to: number;
  content: Marko.Body<[number]>
}

<for|i| from=0 to=input.to by=2>
  <${input.content}(i)/>
</for>
```

```marko
/* index.marko */
<for-by-two|i| to=10>
  <div>${i}</div>
</for-by-two>
```

### Typing Attribute Tags

All attribute tags are typed as iterable with a `[Symbol.iterator]`, regardless of intent. This means all attribute tag inputs must be wrapped in `Marko.AttrTag`.

```marko
/* my-select.marko */
export interface Input {
  option: Marko.AttrTag<Marko.HTML.Option>
}

<select>
  <for|option| of=input.option>
    <option ...option/>
  </for>
</select>
```

### Extending native tag types within a Marko tag

The types for native tags are accessed via the global `Marko.HTML` namespace. Here's an example of a component that extends the `button` html tag:

```marko
/* color-button.marko */
export interface Input extends Marko.HTML.Button {
  color: string;
}

<const/{ color, ...attrs }=input>

<button style=`color: ${color}` ...attrs/>
```

> [!TIP]
> Since Marko 6, native tags have supported including [`content`](./language.md#tag-content) as an attribute so there is no need to inject manually
> ```marko
> <button style=`color: ${color}` ...attrs>
>   // no longer required!
>   <${input.content}/>
> </button>
> ```

### Registering a new native tag (e.g. for custom elements)

```ts
interface MyCustomElementAttributes {
  // ...
}

declare global {
  namespace Marko {
    interface NativeTags {
      // By adding this entry, you can now use `my-custom-element` as a native html tag.
      "my-custom-element": MyCustomElementAttributes;
    }
  }
}
```

### Registering new "global" HTML Attributes

```ts
declare global {
  namespace Marko {
    interface HTMLAttributes {
      "my-non-standard-attribute"?: string; // Adds this attribute as available on all HTML tags.
    }
  }
}
```

### Registering CSS Properties (eg for custom properties)

```ts
declare global {
  namespace Marko {
    namespace CSS {
      interface Properties {
        "--foo"?: string; // adds a support for a custom `--foo` css property.
      }
    }
  }
}
```

## TypeScript Syntax in `.marko`

Any JavaScript expression in Marko can also be written as a TypeScript expression.

```marko
<my-tag foo=1 as any>
  ${(input.el as HTMLInputElement).value}
</my-tag>
```

### Tag Type Parameters

```marko
<child <T>|value: T|>
  ...
</child>
```

### Tag Type Arguments

```marko
/* components/child.marko */
export interface Input<T> {
  value: T;
}
```

```marko
/* index.marko */
// number would be inferred in this case, but we can be explicit
<child<number> value=1 />
```

### Method Shorthand Type Parameters

```marko
<child process<T>() { /* ... */ } />
```

### Attribute Type Assertions

The types of attribute values can _usually_ be inferred. When needed, you can assert values to be more specific with [TypeScript’s `as` keyword](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#type-assertions):

```marko
<some-component
  number=1 as const
  names=[] as string[]
/>
```

## JSDoc Support

For existing projects that want to incrementally add type safety, adding full TypeScript support is a big leap. This is why Marko also includes full support for [incremental typing via JSDoc](https://www.typescriptlang.org/docs/handbook/intro-to-js-ts.html).

### Setup

You can enable type checking in an existing `.marko` file by adding a `// @ts-check` comment at the top:

```js
// @ts-check
```

If you want to enable type checking for all Marko & JavaScript files in a JavaScript project, you can switch to using a [`jsconfig.json`](https://www.typescriptlang.org/docs/handbook/tsconfig-json.html#using-tsconfigjson-or-jsconfigjson). You can skip checking some files by adding a `// @ts-nocheck` comment to files.

Once that has been enabled, you can start by typing the input with JSDoc. Here's an example component with typed `input`:

```marko
// @ts-check

/**
 * @typedef {{
 *   firstName: string,
 *   lastName: string,
 * }} Input
 */

<div>${firstName} ${lastName}</div>
```

## CI Type Checking

For type checking Marko files outside of your editor there is the [`@marko/type-check` cli](https://github.com/marko-js/language-server/tree/main/packages/type-check). See the CLI documentation for more information.

## Profiling Performance

The [`--generateTrace`](https://www.typescriptlang.org/tsconfig/#generateTrace) flag can be used to determine the parts of a codebase which are using the most resources during type checking.

```sh
mtc --generateTrace TRACE_DIR
```


----------

<!-- concise-syntax.md -->

# Concise syntax

Marko's concise syntax is very similar to the HTML syntax, except it's more... concise. Angle brackets are removed, and nesting is indentation-based.

All Marko files are in concise mode by default, and switch to HTML mode once there is a tag that uses the HTML syntax.

```marko no-format
div class="thumbnail"
    img src="https://example.com/thumb.png"

// identical to

<div class="thumbnail"><img src="https://example.com/thumb.png" /></div>
```

## Attributes on multiple lines

Attributes may be comma-separated in all Marko tags.

```marko no-format
div id="hello", class=["class1", "class2", "class3"], style={ border: "1px solid red" }
```

Since commas indicate that another attribute is expected, they may be used to spread attributes across multiple lines.

```marko no-format
div id="hello" class="world",
  style={ border: "1px solid red" }
```

By convention, readability is improved if commas are organized at the _beginning_ of each line with attributes.

```marko no-format
div
  ,id="hello"
  ,class=["class1", "class2", "class3"]
  ,style={ border: "1px solid red" }
  -- hello
```

## Text

Two or more hyphens (`--`) followed by whitespace may be used to begin [content](./language.md#tag-content).

If text immediately follows the hyphens, the content is terminated at the end of the line.

```marko no-format
-- Hello world
div -- Hello world
```

If hyphens are followed by a newline, the content is terminated by the same number of hyphens or at the next dedentation.

```marko no-format
--
This is
a bunch of
text at the
root of
the tag
--
details
  --
  since this is normal tag content,
  regular <strong>HTML Mode</strong>
  tags may be used freely.
  --
  summary --
    This content is
    implicitly closed
```

> [!TIP]
> There may be _more_ than two hyphens if necessary, but the number hyphens in the open and close must match.
>
> ```marko no-format
> pre
>   ---------------------
>      ---   ---   ---
>    --- -- -- ---  ---
>   ---   ---   ---  ---
>    ---       ---  ---
>     ---     ---  ---
>   ---------------------
> ```

### Root level text

The Marko parser starts out in the concise mode. Therefore, given the following template:

```marko no-format
Hello World
Welcome to Marko
```

The output is:

```marko no-format
<Hello World></Hello><Welcome to Marko></Welcome>
```

The proper way to include root level text is with [code fences](#text).

```marko no-format
-- Welcome to Marko
```

<!--

The proper way to include root level text is with [string literals or code fences](#text).

```marko no-format
"Hello World"
-- Welcome to Marko
```

## Line Termination

A semicolon (`;`) indicates a newline

```marko no-format
div; span; p

// identical to

div
span
p
```

A right angle bracket (`>`) indicates a newline _with_ a tab (i. e. nested content).

```marko no-format
div > span > p

// identical to

div
  span
    p
```

> [!TIP]
> You can use the nesting syntax (`>`) to limit the amount of space before deeply nested content
>
> ```
> div.shell > div.wrapper > p
>   -- This text belongs to the paragraph
> ```

-->

----------

<!-- template.md -->

# Template API Reference

All `.marko` files expose the same API on their [default export](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/export#using_the_default_export).
These methods are used to generate an HTML string on the server, and to modify the [DOM](https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model) in the browser.

## `Template.render(input)`

| Parameter | Default | Details                                                                                                                 |
| :-------- | :------ | :---------------------------------------------------------------------------------------------------------------------- |
| `input`   | `{}`    | The [`input` object](./language.md#input) for the template. May also include [`$global`](#inputglobal) for global state |

For use on the **server**, the `.render()` API on a Marko template provides an object containing a variety of ways to generate an HTML string. Its first parameter becomes the [`input`](./language.md#input) available within the template.

### Async Iterator

The render result contains an [async iterator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols#the_async_iterator_and_async_iterable_protocols), which allows consumption through a [`for await` statement](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for-await...of).

```js
import Template from "./template.marko";

for await (const chunk of Template.render({})) {
  // send the html chunk somewhere.
}
```

### Pipe

The `.pipe()` method in the render result object sends an HTML string into a [NodeJS `stream.Writable`](https://nodejs.org/api/stream.html#class-streamwritable).

```js
import Template from "./template.marko";
import http from "node:http";

http
  .createServer((req, res) => {
    // Stream rendered html into the server response.
    Template.render({}).pipe(res);
  })
  .listen(3000);
```

### ReadableStream

The `.toReadable()` method in the render result object returns a [WHATWG ReadableStream](https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream). This can be used in environments that support web apis, eg in a web worker.

```js
const webHTMLResponse = new Response(Template.render({}).toReadable(), {
  headers: { "content-type": "text/html" },
});
```

### Thenable

The render result is a [thenable](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise#thenables), so the `.then()`, `.catch()` or `.finally()` methods return a `Promise<string>` that resolves with a buffered HTML string. This may be handled implicitly with the [`await`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/await) keyword.

```js
const html = await Template.render({});
```

> [!NOTE]
> By using thenable and `await`, you are opting out of Marko's streaming capabilities.

#### toString

The result implements a `toString()` that returns the buffered `html` synchronously if possible.

```js
const html = Template.render({}).toString();
```

> [!CAUTION]
> If there is any async behavior (i.e. an [`<await>` tag](./core-tag.md#await)) this method will throw.

## `Template.mount(input, node, position?)`

| Parameter  | Default       | Details                                                                                                                                                                                       |
| :--------- | :------------ | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `input`    | `{}`          | The [`input` object](./language.md#input) for the template. May also include [`$global`](#inputglobal) for global state                                                                       |
| `node`     | `undefined`   | A reference to the DOM node where the template will be rendered                                                                                                                               |
| `position` | `"beforeend"` | Location to render the template, relative to `node`. Value follows the [Element.insertAdjacentHTML API](https://developer.mozilla.org/en-US/docs/Web/API/Element/insertAdjacentHTML#position) |

For use in the **browser/client**, The `.mount()` API on a Marko template builds up a [reactive](./reactivity.md) DOM and inserts it at the specified `node` and `position`. The `input` argument becomes the [`input`](./language.md#input) available within the template.

```js
template.mount({}, document.body); // append to the body.
```

Or with a `position` override

```js
template.mount({}, document.body, "afterbegin"); // prepended to the body
```

> [!NOTE]
> Valid values for `position` are based on [`insertAdjacentHTML()`](https://developer.mozilla.org/en-US/docs/Web/API/Element/insertAdjacentHTML#position):
>
> - `"beforebegin"`: Before the element.
> - `"afterbegin"`: Just inside the element, before its first child.
> - `"beforeend"`: Just inside the element, after its last child.
> - `"afterend"`: After the element.
>
> which, if the element is this `<p>`, can be visualized as
>
> ```html
> <!-- "beforebegin" -->
> <p>
>   <!-- "afterbegin" -->
>   existing body content
>   <!-- "beforeend" (default) -->
> </p>
> <!-- "afterend" -->
> ```

### Render Result

The [`.mount()` API](#templatemountinput-node-position) returns an object with helpers used update and destroy the instance of the template and DOM that was built.

```js
const instance = template.mount({ name: "foo" }, document.body);
```

> [!Warning]
> This API is **not** the recommended way to update/destroy Marko templates. It is primarily intended to be used in exclusively client rendered environments and/or while testing. Instead the [reactive system](./reactivity.md) should be used.

#### instance.update(input)

The `.update()` method allows providing new [`input`](./language.md#input) to the instance of the template with a reactive update.

```js
instance.update({ name: "bar" });
```

This update to the `input` is applied synchronously.

#### instance.destroy()

The `.destroy()` method causes every [`$signal`](./language.md#signal) to be aborted and runs cleanup for the instance.

```js
instance.destroy();
```

## `input.$global`

When a template is rendered via the [`render`](#templaterenderinput) or [`mount`](#templatemountinput-node-position) APIs, the `input` object may specify a `$global` property which will be stripped off and used as [`$global`](./language.md#global) within all rendered `.marko` templates.

Some properties on the `$global` are picked up by Marko itself and have predefined functionality.

### `$global.signal`

> <code>[AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) | undefined</code>

When `signal` is included in `$global`, Marko will listen to it and automatically clean up any pending async rendering activity when it is aborted.

This is used to, for example, prevent continued rendering after an incoming request is aborted.

### `$global.cspNonce`

> `string | undefined`

This value should be a string that represents a valid [csp nonce](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/nonce). Marko will automatically set this value as the `nonce` on all assets (`<script>`, `<style>`, etc) rendered by the template.

### `$global.renderId`

> `string | undefined`

The `runtimeId` is used to isolate runtimes when there are multiple copies on the same page, and is generally not necessary as `@marko/vite` and `@marko/webpack` plugins will automatically provide one based off of the project level `package.json` name.

### `$global.runtimeId`

> `string | undefined`

The `renderId` is used to isolate distinct server renders (using the same runtime) and is not automatically set. This value should be set such that all server rendered segments of `html` have a unique `renderId` string to avoid conflicts. This is particularly useful for solutions such as [micro-frame](https://github.com/marko-js/micro-frame).
