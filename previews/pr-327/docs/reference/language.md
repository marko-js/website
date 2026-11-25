# Language Reference

Marko is a superset of [well-formed](https://en.wikipedia.org/wiki/Well-formed_document) HTML. It enforces strict tag structure while extending HTML with JavaScript expressions, control flow, and compiled reactivity.

## Syntax Legend

<div class="code-block">
<pre class="html html-ts"><code><a href="#statements">import "...";</a>
&lt;<a href="#tags">tag</a>|...<a href="#tag-parameters">params</a>|/<a href="#tag-variables">var</a> ...<a href="#attributes">attrs</a>&gt;
  <a href="#tag-content">content</a> with <a href="#dynamic-text">&#36;{placeholders}</a>
  &lt;<a href="#attribute-tags">@attr-tag</a>/&gt;
&lt;/&gt;</code></pre>
<pre class="concise concise-ts"><code><a href="#statements">import "...";</a>
<a href="#tags">tag</a>|...<a href="#tag-parameters">params</a>|/<a href="#tag-variables">var</a> ...<a href="#attributes">attrs</a>
  -- <a href="#tag-content">content</a> with <a href="#dynamic-text">&#36;{placeholders}</a>
  <a href="#attribute-tags">@attr-tag</a></code></pre>
</div>

> [!NOTE]
> Click any part of the legend to jump to its section. Also see [`<${dynamic}/>` tags](#dynamic-tags), [Attributes](#attributes), [Tag Arguments](#tag-arguments), and [Concise Syntax](./concise-syntax.md).

## Template Variables

Three variables are automatically available inside every template body.

### `input`

A JavaScript object holding the [attributes](#attributes) passed to a [custom tag](./custom-tag.md), or the data passed to the [Template API](./template.md).

### `$signal`

An [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) available inside template expressions, event handlers, and effect blocks (not in module-level [statements](#statements)). `$signal` exists only in the browser and is used to clean up side effects.

It aborts when:

1. Any reactive value ([tag variable](#tag-variables), [tag parameter](#tag-parameters), or [`input`](#input)) read by the expression or effect using `$signal` changes, including reads inside callbacks it registers
2. The template or [tag content](#tag-content) is removed from the DOM

> [!CAUTION]
> `$signal` is browser-only. Reading it during a server render (such as in an attribute, [`<const>`](./core-tag.md#const), or [interpolation](#dynamic-text)) is invalid:
>
> ```marko
> // ❌ Invalid during a server render
> <const/results=fetch("/api/search", { signal: $signal })>
> ```
>
> Use `$signal` only in browser-only contexts: [`<script>`](./core-tag.md#script) bodies, [`<lifecycle>`](./core-tag.md#lifecycle) hooks, and [event handlers](./native-tag.md#event-handlers).

<!---->

> [!TIP]
> Pass `$signal` directly to web APIs such as [`addEventListener()`](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener#signal) for automatic cleanup. To register a run-once listener whose callback reads reactive state without re-registering on every change, use [`<lifecycle>`](./core-tag.md#lifecycle).
>
> ```marko
> <script>
>   window.addEventListener("resize", () => {
>     // automatically removed when the signal aborts
>   }, { signal: $signal });
> </script>
> ```

### `$global`

Provides access to the [render globals](./template.md#inputglobal) passed to the [Template API](./template.md).

## Statements

Marko supports module-scoped statements at the root of a template. These run once when the template module loads rather than on every render.

### `import`

Standard JavaScript [`import`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import) statements are valid at the template root and are shorthand for `static import`.

```marko
import sum from "sum";

<div data-number=sum(1, 2)/>
```

#### Tag `import` Shorthand

Angle brackets in the `from` specifier resolve a [custom tag](./custom-tag.md) using Marko's tag discovery rules:

```marko
import MyTag from "<my-tag>";

<MyTag/>
```

#### Lazy Tag `import`

Adding a `load` [import attribute](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import/with) splits the tag into a separate browser bundle loaded on demand:

```marko
import HeavyChart from "<heavy-chart>" with { load: "visible#chart" };

<div#chart>
  <HeavyChart data=input.data/>
</div>
```

See [Lazy Loading](./lazy-loading.md) for triggers and constraints.

### `export`

Named JavaScript [`export`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/export) statements are valid at the template root. The default export is reserved for the template itself.

```marko
export function getAnswer() {
  return 42;
}

<div>${getAnswer()}</div>
```

### `static`

Statements prefixed with `static` execute in module scope when the template loads on both server and browser. Any valid JavaScript statement, declaration, or block is supported (a `static { ... }` block unwraps its top-level bindings into module scope):

```marko
static const answer = 41;
static function getAnswer() {
  return answer + 1;
}

<div data-answer=getAnswer()/>
```

```marko
static {
  console.log("Logged once when the module loads");
}
```

### `server` and `client`

Statements prefixed with `server` or `client` execute in module scope only in that target environment. Bindings declared in one environment evaluate to `undefined` in the other.

```marko
server console.log("on the server");
client console.log("in the browser");
```

Environment prefixes also combine with `import` statements and blocks:

```marko
server import { connectToDatabase } from "./database";
client import "bootstrap";

server {
  const db = connectToDatabase();
  const users = await db.query("SELECT * FROM users");
  console.log(`Found ${users.length} users`);
}
```

## Tags

Marko supports all native HTML, SVG, and MathML tags alongside [core tags](./core-tag.md) and [custom tags](./custom-tag.md) (local or installed via `node_modules`). All tags share the same syntax:

```marko
<my-tag/>
```

Any tag without [content](#tag-content) may be self-closed (`<div/>`). [Void elements](https://developer.mozilla.org/en-US/docs/Glossary/Void_element) such as `<input>` and `<br>` require neither a closing tag nor a trailing `/`.

Any closing tag may omit its name:

```marko no-format
<div>Hello World</>
```

## Attributes

Attribute values are JavaScript expressions, including quoted strings (`str="Hello"` is a JavaScript string literal, not an HTML attribute string):

```marko
<my-tag str="Hello"/>
<my-tag str=`Hello ${name}`/>
<my-tag num=1 + 1/>
<my-tag date=new Date()/>
<my-tag fn=function myFn(param1) { console.log("hi") }/>
```

Dynamic native attribute values are encoded for HTML attribute syntax (escaping the active quote character, `\r`, and `&` when it would begin a character reference).

> [!CAUTION]
> Attribute encoding protects HTML syntax only. URL-valued attributes such as `href` and `src` are written as given, so check untrusted URLs against an allowlist of schemes (excluding `javascript:`, `data:`, and unexpected protocol-relative `//` URLs).

<!---->

> [!CAUTION]
> Unenclosed `>` is ambiguous with the end of a tag, so wrap comparisons with `>` in parentheses. Whitespace-preceded `>=` and arrow functions (`=>`) need no parentheses:
>
> ```marko
> <my-tag value=(1 > 2)/>
> <my-tag value=count >= 10/>
> <my-tag fn=x => x * 2/>
> ```

### Skipped Attributes

Attributes whose value is `null`, `undefined`, or `false` are omitted from the HTML output. Other falsy values (`0`, `0n`, `NaN`, and `""`) are still written, except empty `class=""` and `style=""`, which are omitted. [Dynamic text](#skipped-values) uses different skip rules.

### Boolean Attributes

A valueless attribute evaluates to `true`. On native tags, `true` emits the attribute name with no value:

```marko
<input type="checkbox" checked>
<input type="checkbox" checked=true>
```

> [!IMPORTANT]
> [ARIA enumerated attributes](https://developer.mozilla.org/en-US/docs/Glossary/Enumerated#aria_enumerated_attributes) expect explicit string values (`"true"` / `"false"`), not HTML boolean attributes:
>
> ```marko
> // ❌ emits `<button aria-pressed></button>`
> <button aria-pressed=isPressed/>
>
> // ✅ emits `<button aria-pressed=true></button>` or `"false"`
> <button aria-pressed=String(isPressed)/>
> ```

### Spread Attributes

[Spread syntax](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax#spread_in_object_literals) applies an object of attributes to a tag:

```marko
<my-tag ...input foo="bar"/>
```

Attributes merge from left to right, with later attributes overriding earlier ones. The spread target can be any JavaScript expression, including an object literal shorthand:

```marko
<my-tag ...{ property }/>
```

On [native tags](./native-tag.md#attribute-spreads), a spread also manages removal of attributes dropped on subsequent updates.

### Shorthand Methods

[Method definitions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Method_definitions) pass functions concisely as attributes:

```marko
<button onClick(e) { console.log(e.target) }>Click Me</button>
```

Native tag event handlers also receive [the attached element](./native-tag.md#handler-arguments) as a second parameter. Prefix the method with `async` to use `await` inside its body:

```marko
<button async onClick() { await save() }>Save</button>
```

### Shorthand Change Handlers (Two-Way Binding)

`attr:=x` is optional shorthand for passing both `attr=` and `attrChange=`. Its right-hand side must be a [tag variable](#tag-variables), a destructured object property, or a property accessor (including optional `input.a?.b` and computed `obj[key]` access).

For a mutable [tag variable](#tag-variables), `:=` desugars to an assignment handler:

```marko
<counter value:=count/>

// desugars to
<counter value=count valueChange(newCount) { count = newCount }/>
```

For a property accessor (or a destructured object property such as `<const/{ count }=input>`), `:=` forwards the corresponding `*Change` property:

```marko
<counter value:=input.count/>

// desugars to
<counter value=input.count valueChange=input.countChange/>
```

#### Refining Function

Insert `:fn:=` to transform values before passing them to the change handler:

```marko
<input type="number" value:parseFloat:=num>

// desugars to
<input type="number" value=num valueChange(newValue) { num = parseFloat(newValue) }>
```

For property accessors, the generated handler only runs when the upstream change handler is defined:

```marko
<input type="number" value:parseFloat:=input.num>

// desugars to
<input
  type="number"
  value=input.num
  valueChange=(input.numChange && ((newValue) => {
    input.numChange(parseFloat(newValue));
  }))
>
```

### Shorthand `class` and `id`

[Emmet-style](https://docs.emmet.io/abbreviations/syntax/#id-and-class) `#id` and `.class` shorthands attach directly to a tag name. Omitting the tag name defaults to `div`, and shorthand classes merge with any `class=` attribute.

```marko no-format
<div#foo.bar.baz/>

// same as
<div id="foo" class="bar baz"/>
```

Interpolations work inside shorthand `id` and `class` names:

```marko no-format
<div.icon-${iconName}/>
```

### Shorthand `value`

Omitting the attribute name at the start of a tag passes the value as `value=`:

```marko
<my-tag=1/>

// desugars to
<my-tag value=1/>
```

Combining this with [method shorthand](#shorthand-methods) passes a `value` function:

```marko
<my-tag() {
  console.log("Hello JavaScript!");
}/>

// desugars to
<my-tag value=function () {
  console.log("Hello JavaScript!");
}/>
```

### Attribute Termination

Attributes may be separated with commas, which is primarily used for [multiline attributes in concise syntax](./concise-syntax.md#attributes-on-multiple-lines):

```marko
<my-tag a=1, b=2/>
```

> [!CAUTION]
> Wrap JavaScript [comma expressions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Comma_operator) in parentheses so the comma is not parsed as an attribute separator:
>
> ```marko
> <my-tag a=(console.log(foo), foo)/>
> ```

## Tag Content

Markup inside a tag's body is passed to the tag as `input.content`. Custom tags render it with a [dynamic tag](#dynamic-tags):

```marko
/* card.marko */
export interface Input {
  content: Marko.Body;
}

<div class="card">
  <${input.content}/>
</div>
```

```marko
/* index.marko */
<card>Content</card>
```

[Native tags](./native-tag.md#content) also accept `content=` as an attribute, so the wrapper above can be written `<div class="card" content=input.content/>`.

### Dynamic Text

Interpolate JavaScript expressions inside tag content with `${expression}`, matching JavaScript [template literals](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals):

```marko
export interface Input {
  name: string;
}

<div>Hello ${input.name}</div>
```

Static text in markup is emitted verbatim (preserving HTML character references). Dynamic `${...}` text escapes `<`, `&`, and `\r` to `&lt;`, `&amp;`, and `&#13;` to prevent [XSS](https://developer.mozilla.org/en-US/docs/Web/Security/Attacks/XSS).

#### Skipped Values

Interpolated `null`, `undefined`, `false`, `""`, `NaN`, and `0n` render nothing. All other values convert via string concatenation (`0` renders `0`, `true` renders `true`, arrays join with commas). The same skip rules apply inside [`<html-script>` and `<html-style>`](./core-tag.md#html-script--html-style).

> [!NOTE]
> [Skipped attributes](#skipped-attributes) only omit `null`, `undefined`, and `false`, writing `NaN`, `""`, and `0n`.

<!---->

> [!WARNING]
> Plain objects stringify to `[object Object]`. Render promises with [`<await>`](./core-tag.md#await) rather than interpolating the promise directly.

#### Unescaped Text

Prefix an interpolation with `!` (`$!{...}`) to emit raw, unescaped HTML generated and sanitized elsewhere:

```marko
export interface Input {
  articleHtml: string;
}

<article>$!{input.articleHtml}</article>
```

> [!CAUTION]
> Unescaped interpolations write directly into the document and expose the page to [XSS](https://developer.mozilla.org/en-US/docs/Web/Security/Attacks/XSS) if given untrusted input.

## Whitespace

Runs of whitespace in markup collapse to a single space. Any whitespace-only run that begins with a line break is removed completely, keeping source indentation out of the output. Both tags and `${...}` placeholders act as boundaries for this rule.

```marko no-format
<p>
  Build finished in
  <strong>12s</strong> <em>from cache</em>
</p>
```

Renders:

```html
<p>Build finished in <strong>12s</strong> <em>from cache</em></p>
```

> [!WARNING]
> A line break immediately between tags or `${...}` placeholders produces no space (`<b>Total:</b>` followed by a newline and `${amount}` renders `<b>Total:</b>5`, and `${a}` followed by a newline and `${b}` renders `AB`). Keep a space on the same line when separation is needed.

Whitespace is preserved verbatim inside [`<pre>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/pre), [`<textarea>`](./native-tag.md#textarea), [`<script>`](./core-tag.md#script), [`<style>`](./core-tag.md#style), [`<html-script>`, and `<html-style>`](./core-tag.md#html-script--html-style).

## Attribute Tags

Tags prefixed with `@` pass named or repeated sections of [content](#tag-content) and attributes into the parent tag's [`input`](#input) instead of rendering directly:

```marko
/* index.marko */
<my-layout title="Welcome">
  <@header class="banner">
    <h1>Big things are coming!</h1>
  </@header>

  <p>Page body</p>
</my-layout>
```

```marko
/* tags/my-layout.marko */
export interface Input {
  title: string;
  header: Marko.AttrTag<{
    class: string;
    content: Marko.Body;
  }>;
  content: Marko.Body;
}

<header class=input.header.class>
  <${input.header.content}/>
</header>
<main>
  <${input.content}/>
</main>
```

`<my-layout>` receives:

```js
{
  title: "Welcome",
  header: {
    class: "banner",
    content: /* <h1>Big things are coming!</h1> */,
  },
  content: /* <p>Page body</p> */,
}
```

> [!NOTE]
> Control flow tags ([`<if>`](./core-tag.md#if--else) and [`<for>`](./core-tag.md#for)) pass nested attribute tags upward to their enclosing tag; see [Conditional Attribute Tags](#conditional-attribute-tags).

### Nested Attribute Tags

Attribute tags can nest inside other attribute tags, becoming properties on their parent attribute tag:

```marko
<my-tag>
  <@a value=1>
    <@b value=2/>
  </>
</>
```

Provides the following `input`:

```js
{
  a: {
    value: 1,
    b: { value: 2 },
  },
}
```

### Repeated Attribute Tags

When an attribute tag appears multiple times with the same name, the property exposes the first instance directly and implements the [iterable protocol](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols#the_iterable_protocol) over all instances:

```marko
/* index.marko */
<my-menu>
  <@item value="foo">Foo Item</@item>
  <@item value="bar">Bar Item</@item>
</my-menu>
```

```marko
/* tags/my-menu.marko */
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

Use singular names for attribute tags (`<@item>`, iterated as `input.item`) even when repeated.

> [!TIP]
> Spread a repeated attribute tag into an array when random access or `.length` is needed:
>
> ```marko
> export interface Input {
>   item?: Marko.AttrTag<{}>;
> }
>
> <const/items=[...(input.item || [])]>
> <div>${items.length}</div>
> ```

### Conditional Attribute Tags

[`<if>`](./core-tag.md#if--else) and [`<for>`](./core-tag.md#for) apply attribute tags dynamically to their enclosing tag:

```marko
<my-message>
  <if=welcome>
    <@title>Hello</>
  </if>
  <else>
    <@title>Goodbye</>
  </else>
</my-message>
```

```marko
<my-select>
  <@option>None</@option>
  <for|opt| of=["a", "b", "c"]>
    <@option>${opt}</>
  </for>
</my-select>
```

> [!NOTE]
> A control flow branch may contain attribute tags or default [content](#tag-content), not both in the same branch.

## Tag Variables

Tag variables expose reactive values from a tag into the template scope, written as `/` followed by an identifier or [destructuring pattern](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment). Custom tags expose values through [`<return>`](./core-tag.md#return).

```marko
<my-tag/foo/>
<my-other-tag/{ bar, baz }/>

<div>${foo}</div>
<div>${bar}, ${baz}</div>
```

[Native tags](./native-tag.md#element-references) expose a getter function returning the DOM element (native tag variables must be a single identifier, not a destructuring pattern):

```marko
<div/myDiv/>

<script>
  myDiv().innerHTML = "Hello";
</script>
```

### Tag Var Scope

Function-valued tag variables (including native [element references](./native-tag.md#element-references)) are [hoisted](https://developer.mozilla.org/en-US/docs/Glossary/Hoisting) across the template body (excluding module [statements](#statements)). Non-function `<let>`, `<const>`, and `<define>` tag variables are scoped to their enclosing block.

```marko
<form>
  <input/myInput/>
</form>

<script>
  console.log(myInput());
</script>
```

Hoisted references are readable only in code that runs after render: [`<script>`](./core-tag.md#script) bodies, [`<lifecycle>`](./core-tag.md#lifecycle) hooks, and [event handlers](./native-tag.md#event-handlers).

> [!WARNING]
> Attributes, [`<const>`](./core-tag.md#const), and [interpolations](#dynamic-text) evaluate during render, before hoisted references are readable:
>
> ```marko
> // ❌ `myInput` is read while the template renders
> <div>${myInput().value}</div>
> ```

### Repeated Tag Vars

When a hoisted tag variable originates inside a loop or repeated scope, it also implements the [iterable protocol](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols#the_iterable_protocol) while calling it directly returns the first match:

```marko
<for until=10>
  <div/$el/>
</for>

<script>
  $el().style.color = "red";

  let i = 0;
  for (const el of $el) {
    el.textContent = String(i++);
  }
</script>
```

## Tag Parameters

A tag can pass values back into its [content](#tag-content) as `|parameters|` enclosed in pipes after the tag name:

```marko
/* child.marko */
export interface Input {
  content: Marko.Body<[{ number: number }]>;
}

<div>
  <${input.content} number=1337/>
</div>
```

```marko
/* parent.marko */
<child|params|>
  Rendered with ${params.number} as the `number=` attribute.
</child>
```

Renders:

```html
<div>Rendered with 1337 as the `number=` attribute.</div>
```

Parameters support full [JavaScript function parameter syntax](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions#function_parameters), including destructuring (`<child|{ number }|>`).

### Tag Arguments

Pass positional arguments instead of named attributes with `(...args)` after the tag name:

```marko
/* child.marko */
export interface Input {
  content: Marko.Body<[number, number, number]>;
}

<${input.content}(1, 2, 3)/>
```

```marko
/* parent.marko */
<child|a, b, c|>
  Sum ${a + b + c}
</child>

<child|...all|>
  Sum ${all.reduce((a, b) => a + b, 0)}
</child>
```

Custom tags accept either attributes or a single positional argument (with no body content). Dynamic tags and `content` bodies accept either attributes or multiple positional arguments (including spreads) alongside optional body content.

```marko
<my-tag a=1 b=2 c=3/>
// identical to
<my-tag({ a: 1, b: 2, c: 3 })/>
```

### Tag Param Scope

Tag parameters are scoped strictly to the tag's [content](#tag-content) and are not accessible outside the body or inside [attribute tags](#attribute-tags).

## Doctype

A [doctype](https://developer.mozilla.org/en-US/docs/Glossary/Doctype) writes directly to the HTML output in the template that renders the full document:

```marko
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
  </head>
  <body>
    <status-board/>
  </body>
</html>
```

## Comments

Both [HTML](https://developer.mozilla.org/en-US/docs/Web/HTML/Comments) and [JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Lexical_grammar#comments) comments are supported and stripped from rendered output:

```marko
<div>
  <!-- HTML comment -->
  // JavaScript line comment
  /* JavaScript block comment */
</div>
```

> [!NOTE]
> To emit a literal HTML comment into the output, use [`<html-comment>`](./core-tag.md#html-comment).

## Dynamic Tags

An `${expression}` in the tag name position renders a [native tag](./native-tag.md), [custom tag](./custom-tag.md), or [tag content](#tag-content) dynamically. Close dynamic tags with `</>` or self-close with `/>`.

### Dynamic Native Tags

When the expression evaluates to a string, Marko renders a native HTML element with that tag name:

```marko
export interface Input {
  headingSize: 1 | 2 | 3 | 4 | 5 | 6;
}

<${"h" + input.headingSize}>Hello!</>
```

> [!CAUTION]
> String tag names write directly into the document and expose the page to [XSS](https://developer.mozilla.org/en-US/docs/Web/Security/Attacks/XSS) if untrusted. Never pass user-provided strings as dynamic tag names.

### Dynamic Custom Tags

Pass an imported tag reference, [`<define>`](./core-tag.md#define) variable, or `Marko.Body` directly:

```marko
import MyTagA from "<my-tag-a>";
import MyTagB from "<my-tag-b>";

<${Math.random() > 0.5 ? MyTagA : MyTagB}/>
```

Objects carrying a `.content` property (such as `<define>` tag variables) or a `.default` module export are unwrapped automatically.

> [!CAUTION]
> Strings always render native HTML elements (`document.createElement("my-tag-a")`), never custom tags. Pass the imported tag reference instead:
>
> ```marko
> // Renders a native `<my-tag-a>` or `<my-tag-b>` element, not a custom tag
> <${Math.random() > 0.5 ? "my-tag-a" : "my-tag-b"}/>
> ```

### Conditional Parent Tags

When a dynamic tag name evaluates to a [falsy](https://developer.mozilla.org/en-US/docs/Glossary/Falsy) value, Marko renders its [content](#tag-content) without a wrapper element:

```marko
export interface Input {
  href?: string;
}

<${input.href && "a"} href=input.href>Hello World</>
```

### PascalCase Variables

Any local variable starting with an uppercase letter (`PascalCase`) can be invoked directly as a tag without `${...}`:

```marko
import MyTag from "./my-tag.marko";

<MyTag/>
// equivalent to
<${MyTag}/>
```

> [!WARNING]
> A dot in a tag name is parsed as the [`class` shorthand](#shorthand-class-and-id), so `<Toolbar.Undo/>` renders `Toolbar` with `class="Undo"`. Use [dynamic tag](#dynamic-tags) syntax to render a property on an object:
>
> ```marko
> <${Toolbar.Undo}/>
> ```
