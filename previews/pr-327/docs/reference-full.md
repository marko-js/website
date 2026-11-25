<SYSTEM>This is the reference documentation for the Marko Language & JavaScript Framework</SYSTEM>

----------

<!-- language.md -->

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


----------

<!-- custom-tag.md -->

# Custom Tag Discovery

Custom tags are reusable `.marko` components discovered automatically from the filesystem or installed packages without explicit imports.

## Priority

Marko resolves a tag name in the following order:

1. [Local variables](#local-variables) (`PascalCase` identifiers in scope)
2. [Core tags](./core-tag.md) (built-in tags cannot be shadowed by custom tags)
3. [Relative custom tags](#relative-custom-tags) in `tags/` directories up to the nearest `package.json`
4. [Installed custom tags](#installed-custom-tags) from dependencies in `package.json`
5. [Native HTML, SVG, and MathML tags](./native-tag.md)

## Local Variables

When a tag name starts with an uppercase letter, Marko checks local scope first. This handles explicitly imported templates and [`<define>`](./core-tag.md#define) snippets:

```marko
import MyTag from "./my-tag.marko";

<MyTag/>
```

```marko
<define/MyTag|input: { name: string }|>
  <span>Hello ${input.name}</span>
</define>

<MyTag name="HTML"/>
<MyTag name="Marko"/>
```

> [!NOTE]
> Reference a non-`PascalCase` local variable using [dynamic tag syntax](./language.md#dynamic-tags):
>
> ```marko
> import { camelCaseTag } from "somewhere";
>
> <${camelCaseTag}/>
> ```

## Relative Custom Tags

For tags not matched in local scope, Marko walks upward from the current template's directory to the package root (`package.json`), checking each `tags/` directory in precedence order:

1. `tags/TAG_NAME.marko`
2. `tags/TAG_NAME/index.marko`
3. `tags/TAG_NAME/TAG_NAME.marko`
4. One level deep inside a [grouping folder](#grouping-folders)

```text
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

`pages/home/page.marko` resolves:

- `<app-header>`
- `<app-footer>`
- `<home-banner>`

`pages/about/page.marko` resolves:

- `<app-header>`
- `<app-footer>`
- `<team-members>`

The `home` page cannot resolve `<team-members>` and the `about` page cannot resolve `<home-banner>`, scoping page-specific tags to their respective subtrees.

> [!NOTE]
> Marko 5 discovered relative tags in `components/` directories, which are now used as a heuristic for [Marko 5 interop](../guide/marko-5-interop.md).

### Grouping Folders

Related tags can be organized one level deep inside a folder that is not itself a tag. The folder name organizes files on disk without changing tag names:

```text
tags/
  menu-button.marko
  icons/
    icon-chevron.marko
    icon-plus.marko
```

This discovers `<menu-button>`, `<icon-chevron>`, and `<icon-plus>`.

Grouping rules:

- Grouping applies one level deep (`tags/icons/outline/icon-star.marko` is not discovered).
- A folder containing `index.marko`, a matching `FOLDER_NAME.marko`, or `marko-tag.json` is treated as a single tag rather than a grouping folder, so helper files alongside it are not crawled.
- `tags`, `components`, and `node_modules` folders are never treated as grouping folders.
- Dot-prefixed folders (such as `.hidden`) are skipped; non-leading dots (such as `legacy.v1`) still group.

## Installed Custom Tags

Marko inspects packages listed in `package.json` (`dependencies`, `peerDependencies`, and `devDependencies`) for a root `marko.json` with an `"exports"` directory:

```json
/* marko.json */
{
  "exports": "./dist/tags"
}
```

If the package defines a `package.json` `"exports"` map, it must also expose the directory named in `marko.json` because compiled consumer templates import discovered tags by their package path (such as `@acme/ui/dist/tags/acme-icon/index.marko`):

```json
/* package.json */
{
  "exports": {
    "./dist/*": "./dist/*"
  }
}
```

TypeScript tag libraries publish `.d.marko.ts` declarations emitted by `@marko/type-check` alongside their templates (see [TypeScript](./typescript.md#enabling-typescript-in-your-marko-project)).

> [!TIP]
> To keep internal helper tags private to a library, place them in a nested `tags/` directory inside the exported directory (for example `dist/tags/tags/`).

<!---->

> [!CAUTION]
> When two packages export the same tag name, Marko selects the first one discovered. Prefix library tag names (for example `ebay-`) to avoid collisions, or import by path to disambiguate.

## Native Tag Registration

The compiler recognizes standard HTML, SVG, and MathML tags. To emit non-standard elements or [custom elements](./typescript.md#custom-elements) verbatim as native HTML tags, register them in a `marko.json` beside the template or in an ancestor directory:

```json
{
  "<x-datepicker>": { "html": true }
}
```

## Supporting Files

Marko automatically discovers adjacent [stylesheets](../guide/styling.md#auto-discovered-styles) for any `.marko` template using a single extension (`<name>.style.<ext>`, or `style.<ext>` next to `index.marko`). A tag directory may also include a `marko-tag.json`:

```text
tags/
  card.marko
  card.style.css
  modal/
    index.marko
    style.scss
  widget/
    index.marko
    marko-tag.json
```

Any single preprocessor extension (`.css`, `.scss`, `.less`, etc.) is supported.


----------

<!-- reactivity.md -->

# Reactivity Reference

Marko's reactivity system tracks dependencies between state and DOM output at compile time, updating only the affected nodes when values change. Mutable state starts with [`<let>`](./core-tag.md#let).

## Reactive Variables

[Tag variables](./language.md#tag-variables), [tag parameters](./language.md#tag-parameters), and [`input`](./language.md#input) are reactive. Writable state comes from `<let>` and assignable [`<return>`](./core-tag.md#assignable-return-value) tags; other tag variables (`<const>`, `<id>`, `<define>`, element references) are derived or read-only. [`$global`](./language.md#global) is not reactive.

## Render Expressions

Any expression in a template that reads a [reactive variable](#reactive-variables) re-evaluates when that variable changes. Reactive expressions appear in [attributes](./language.md#attributes), [tag arguments](./language.md#tag-arguments), [dynamic text](./language.md#dynamic-text), [dynamic tag names](./language.md#dynamic-tags), [`<style>` dynamic values](./core-tag.md#dynamic-values), [`<html-comment>`](./core-tag.md#html-comment), and [`<script>`](./core-tag.md#script) bodies.

> [!NOTE]
> Module-level [statements](./language.md#statements) (`import`, `export`, `static`, `server`, and `client`) run once when the template module loads and are outside the reactive graph.

```marko
<let/count=0>

<button onClick() { count++ }>
  Current: ${count}
</button>
```

Clicking the button reassigns `count`, and the button text updates automatically.

> [!CAUTION]
> The compiler may group or reorder render expressions into shared update functions, so render expressions must be pure.

<!---->

> [!TIP]
> Marko resolves its reactive dependency graph at compile time rather than tracking subscriptions at runtime, generating direct DOM updates for each state variable.

## Scheduling Updates

Marko compares updates by reference equality (`===`) and batches changes into an update queue flushed on the next [microtask](https://developer.mozilla.org/en-US/docs/Web/API/HTML_DOM_API/Microtask_guide).

Updates scheduled after the microtask flush but before the browser paints are deferred to the next animation frame. This ensures:

- Content ready to paint is not blocked
- Reactive feedback loops are throttled to at most one cycle per frame
- Updates in background tabs pause until the document is visible

For visual motion, prefer CSS [Animations](https://developer.mozilla.org/en-US/docs/Web/CSS/animation), CSS [Transitions](https://developer.mozilla.org/en-US/docs/Web/CSS/transition), or the [Web Animations API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API).

### Stale Derived Values

Assigning to an uncontrolled [`<let>`](./core-tag.md#let) writes the new value into scope immediately, so subsequent lines in the same handler read the updated value. (A [controllable `<let>`](./core-tag.md#controllable-let) invokes its `valueChange` handler instead, updating only when the owner updates and flushes.) Derived values such as [`<const>`](./core-tag.md#const) and rendered DOM nodes recompute when the queue flushes, so they still hold the previous state for the rest of the handler:

```marko
<let/quantity=1>
<const/subtotal=quantity * input.unitPrice>

<button onClick() {
  quantity++;

  // ❌ `subtotal` still holds the previous value until the update queue flushes
  console.log(subtotal);

  // ✅ `quantity` holds the new value; compute the total from it directly
  input.onQuantityChange(quantity, quantity * input.unitPrice);
}>
  Add one
</button>

<output>${subtotal}</output>
```

> [!WARNING]
> Reading `subtotal` or the DOM inside the handler after `quantity++` returns the value from the previous render because the update queue has not flushed yet.


----------

<!-- core-tag.md -->

# Core Tags

## `<if>` / `<else>`

Conditionally renders content or applies [attribute tags](./language.md#attribute-tags).

An `<if>` renders when its `value=` attribute ([shorthand used below](./language.md#shorthand-value)) is [truthy](https://developer.mozilla.org/en-US/docs/Glossary/Truthy). An `<else>` may include an `if=` condition to chain branches, evaluated in order:

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

> [!TIP]
> `<if>` discards its DOM and state when hidden and rebuilds fresh state when shown again. To toggle visibility while preserving state, use [`<show>`](#show).

## `<show>`

Toggles whether its [content](./language.md#tag-content) is attached to the document based on whether `value=` is [truthy](https://developer.mozilla.org/en-US/docs/Glossary/Truthy):

```marko
<show=EXPRESSION>
  Body
</show>
```

Unlike [`<if>`](#if--else), `<show>` renders its content once and keeps it mounted. Toggling `value=` only attaches or detaches the DOM nodes, preserving [tag variables](./language.md#tag-variables), form values, and DOM state:

```marko
<let/showFilters=false>

<button onClick() { showFilters = !showFilters }>Filters</button>

<show=showFilters>
  <input type="search" name="brand" placeholder="Brand">
  <select name="condition">
    <option>New</option>
    <option>Used</option>
  </select>
</show>
```

Because the content is built inline in the surrounding template, a reactive `<show>` ships only a small toggle helper rather than the template code to recreate its body. A statically truthy `<show>` compiles to plain markup with no runtime overhead.

> [!TIP]
> Use `<show>` for content that toggles frequently, holds state worth preserving (form inputs, stateful components, or [`<lifecycle>`](#lifecycle) widgets), or contains bulky static markup. Use [`<if>`](#if--else) when hidden content should not render or appear in server HTML.

<!---->

> [!NOTE]
> Hidden content renders on the server inside a wrapper with the [`hidden`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/hidden) attribute so it can resume without re-rendering; once toggled in the browser, hidden nodes are detached from the document. Because nodes leave the document, transient browser state such as focus and text selection resets on hide.

`<show>` requires [content](./language.md#tag-content) and accepts only `value=`.

## `<for>`

Iterates over collections or numeric ranges to render [content](./language.md#tag-content) or apply [attribute tags](./language.md#attribute-tags), exposing iteration values via [tag parameters](./language.md#tag-parameters):

- Arrays and [iterables](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols#the_iterable_protocol) with `of=`:

  ```marko
  <for|item, index| of=["a", "b", "c"]>
    ${index}: ${item}
  </for>
  ```

- Object entries with `in=`:

  ```marko
  <for|key, value| in={ a: 1, b: 2, c: 3 }>
    ${key}: ${value}
  </for>
  ```

- **Exclusive** numeric ranges with `until=`, `from=`, and `step=`:

  ```marko
  <for|num| until=5>${num}</for>
  // 0 1 2 3 4

  <for|num| from=3 until=7>${num}</for>
  // 3 4 5 6

  <for|num| from=2 until=10 step=2>${num}</for>
  // 2 4 6 8
  ```

- **Inclusive** numeric ranges with `to=`, `from=`, and `step=`:

  ```marko
  <for|num| to=5>${num}</for>
  // 0 1 2 3 4 5

  <for|num| from=3 to=7>${num}</for>
  // 3 4 5 6 7

  <for|num| from=2 to=10 step=2>${num}</for>
  // 2 4 6 8 10
  ```

`step=` accepts negative or fractional values:

```marko
<for|num| from=10 to=0 step=-5>${num}</for>
// 10 5 0

<for|num| from=0 to=1 step=0.25>${num}</for>
// 0 0.25 0.5 0.75 1
```

A nullish `of=` or `in=` renders nothing, so optional values such as [repeated attribute tags](./language.md#repeated-attribute-tags) can be iterated directly.

Pass `by=` on a content-rendering `<for>` to key each iteration so DOM nodes and local state persist across reorderings. `by=` accepts a function receiving the loop parameters, or a property name string when using `of=`:

```marko
<for|user| of=users by=(user) => user.id>
  ${user.firstName} ${user.lastName}
</for>

<for|user| of=users by="id">
  ${user.firstName} ${user.lastName}
</for>
```

Each key must be a string or number unique within the loop.

## `<let>`

Declares mutable reactive state through its [tag variable](./language.md#tag-variables), initialized from `value=`:

```marko
<let/count=1>

<button onClick() { count++ }>
  Current count: ${count}
</button>
```

Reassigning `count` updates every expression that reads it.

> [!NOTE]
> An uncontrolled `<let>` uses `value=` only as its initial value. Subsequent changes to the initializing expression do not overwrite the variable unless the `<let>` is [controllable](#controllable-let).
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

Under TypeScript's `strictNullChecks`, a `<let>` initialized to `null` keeps the type `null` without widening; supply a [type argument or assertion](./typescript.md#tag-type-arguments) such as `<let<string | null>/selected=null>` or `<let/selected=null as string | null>`.

### Controllable Let

Adding `valueChange=` makes `<let>` controllable, matching [native tag change handlers](./native-tag.md#change-handlers). Writes to the tag variable invoke `valueChange` instead of mutating local state directly:

```marko
<let/value="HELLO">
<let/controlledValue=value valueChange(newValue) {
  value = newValue.toUpperCase();
}>
```

In components, forwarding `input.count` via [two-way binding](./language.md#shorthand-change-handlers-two-way-binding) (`<let/count:=input.count>`, shorthand for `<let/count=input.count valueChange=input.countChange>`) lets callers choose uncontrolled or controlled mode:

```marko
/* tags/counter.marko */
export interface Input {
  count: number;
  countChange?: (count: number) => void;
}

<let/count:=input.count>

<button onClick() { count++ }>
  Clicked ${count} times
</button>
```

```marko
/* index.marko */
// Uncontrolled: counter manages its own state starting at 0
<counter count=0/>

// Controlled: parent owns state
<let/count=0>
<counter count:=count/>
<button onClick() { count = 0 }>Reset</button>
```

To make `count?: number` optional with a default value, pass `value=` and `valueChange=` explicitly since `:=` cannot take a fallback such as `?? 0`:

```marko
<let/count=(input.count ?? 0) valueChange=input.countChange>
```

## `<const>`

Declares a reactive derived value computed from `value=` and exposed through its [tag variable](./language.md#tag-variables):

```marko
<let/count=1>
<const/doubleCount=count * 2>

<button onClick() { count++ }>
  Current count: ${count}
  And the double is ${doubleCount}
</button>
```

Because updates are batched, reassigning `count` updates `doubleCount` when the queue flushes rather than synchronously inside the handler (see [Stale Derived Values](./reactivity.md#stale-derived-values)).

> [!NOTE]
> `<const>` is initialized per component instance. For module-wide constants shared across all instances, use [`static const`](./language.md#static).

<!---->

> [!TIP]
> `<const>` is conceptually equivalent to a component returning `input.value`:
>
> ```marko
> export interface Input<T> {
>   value: T;
> }
>
> <return=input.value>
> ```

## `<return>`

Exposes a [tag variable](./language.md#tag-variables) from a [custom tag](./custom-tag.md) via `value=`:

```marko
/* tags/answer.marko */
<return=42>
```

```marko
/* index.marko */
<answer/value/>
<div>${value}</div>
```

> [!WARNING]
> Each template or [tag content](./language.md#tag-content) body may contain at most one `<return>` at its top level. Express conditional return values inside `value=` rather than placing `<return>` inside `<if>` or `<for>`.

### Assignable Return Value

Provide `valueChange=` on `<return>` to allow callers to assign to the exposed tag variable:

```marko
/* tags/uppercase.marko */
export interface Input {
  value: string;
}

<let/value=input.value.toUpperCase()>

<return=value valueChange(newValue) {
  value = newValue.toUpperCase();
}/>
```

```marko
/* index.marko */
<uppercase/value=""/>
<input onInput(e, el) { value = el.value }>
// `value` is always uppercase
<div>${value}</div>
```

### Content Return

A [tag content](./language.md#tag-content) block may also contain `<return>`, read via a tag variable on the tag that renders that content.

With [`<define>`](#define), a snippet can encapsulate state and expose it at its call site:

```marko
<define/ZoomControls>
  <let/level=1>
  <button onClick() { level = Math.max(0.5, level - 0.25) }>Zoom out</button>
  <button onClick() { level = Math.min(3, level + 0.25) }>Zoom in</button>
  <return=level/>
</define>

<ZoomControls/zoom/>
<img alt="Floor plan" src="/blueprint.png" style=`scale: ${zoom}`>
```

For custom tags receiving `input.content`, pass the return type as the second type argument to [`Marko.Body`](./typescript.md#typing-content):

```marko
/* tags/char-limit.marko */
export interface Input {
  max: number;
  content: Marko.Body<[], { value: string }>;
}

<${input.content}/entry/>
<small>${input.max - entry.length} characters left</small>
```

```marko
/* index.marko */
<char-limit max=140>
  <let/bio="">
  <return=bio/>
  <textarea value:=bio/>
</char-limit>
```

## `<script>`

Runs reactive side effects in the browser after the DOM has mounted and updated, including child tag DOM.

A `<script>` re-runs whenever any reactive [tag variable](./language.md#tag-variables), [tag parameter](./language.md#tag-parameters), or `input` property read inside its body changes. Reading a DOM element getter (such as `myButton()`) or assigning to a `<let>` without reading it does not subscribe the effect.

```marko
<let/count=1>
<button/myButton onClick() { count++ }>
  Current count: ${count}
</button>

<script>
  // Runs on mount and whenever `count` changes
  console.log("clicked", myButton(), count, "times");
</script>
```

Pair `<script>` with [`$signal`](./language.md#signal) to clean up listeners, timers, or subscriptions before each re-run and on unmount:

```marko
<script>
  const intervalId = setInterval(() => {
    console.log("time", Date.now());
  }, 1000);

  $signal.onabort = () => clearInterval(intervalId);
</script>
```

> [!NOTE]
> Execution order between separate `<script>` tags (and [`<lifecycle>`](#lifecycle) hooks) is not guaranteed by source order. A `<script>` that reads a reactive tag variable attaches to that variable's initialization, so it can run before an earlier `<script>` that reads no reactive state. Additionally, reading a reactive variable anywhere inside `<script>` (including inside a registered event callback) subscribes the effect and aborts `$signal` on every change. For run-once setup that reads state in callbacks, or for paired restore-and-persist flows, use [`<lifecycle>`](#lifecycle).

### Function Value

An effect can also be supplied via `value=` (written with `=`), receiving no arguments and re-running under the same rules:

```marko
<video/clip src=input.src controls/>

<script=() => (clip().muted = input.muted)/>
```

```marko
<const/remember() {
  sessionStorage.setItem("sidebar", String(input.collapsed));
}>

<script=remember/>
```

### Async Effects

Using `await` in a `<script>` body compiles it to an async function that runs without blocking other effects:

```marko
<img/photo>
<script>
  const signal = $signal;
  photo().src = input.src;
  await photo().decode();
  if (!signal.aborted) photo().classList.add("loaded");
</script>
```

> [!WARNING]
> `$signal` resolves to the active run's signal, so capture it in a local variable before any `await`.

<!---->

> [!TIP]
> To emit a literal HTML `<script>` element instead of a Marko effect, use [`<html-script>`](#html-script--html-style).

## `<style>`

Extracts and bundles CSS so each stylesheet loads once regardless of how many times a template renders:

```marko
<style>
  /* Bundled and loaded once */
  body {
    color: green;
  }
</style>
```

Append an extension to use a CSS preprocessor such as [SCSS](https://sass-lang.com/documentation/syntax/#scss) or [Less](https://lesscss.org/):

```marko
<style.scss>
  $primary-color: green;
  .fancy-scss { color: $primary-color; }
</style>

<div class="fancy-scss">Hello!</div>

<style.less>
  @primary-color: blue;
  .fancy-less { color: @primary-color; }
</style>

<div class="fancy-less">Hello!</div>
```

Adding a [tag variable](./language.md#tag-variables) compiles `<style>` as a [CSS Module](https://github.com/css-modules/css-modules), exposing scoped class names as an object:

```marko
<style/styles>
  .foo { border: 1px solid red; }
  .bar { color: green; }
</style>

<div class=styles.foo/>
<div class=[styles.foo, styles.bar]/>
<div class={ [styles.bar]: true }/>
<div.${styles.foo}/>
```

### Dynamic Values

`<style>` accepts `${...}` interpolations in CSS declaration value positions:

```marko
<style>
  .toast {
    border-color: ${input.tone};
    animation-duration: calc(${input.delay} * 1ms);
  }
</style>

<div class="toast">Saved!</div>
```

The stylesheet remains static and extracted into the CSS bundle. Each interpolation compiles to a [CSS custom property](https://developer.mozilla.org/en-US/docs/Web/CSS/--*) scoped via a small runtime `<style>` element to subsequent sibling elements and their descendants, updating only the custom property when state changes. Values are escaped so untrusted input cannot break out of the stylesheet.

> [!NOTE]
> Place a `<style>` tag with dynamic values before the sibling elements it styles.

Interpolations are valid in CSS declaration values (not selectors, at-rule preludes, property names, quoted strings, unquoted `url(...)`, or concatenated directly with adjacent tokens like `${size}px` or `10${x}`). Include units in the value or multiply with `calc()`:

```marko
<style>
  .dropzone {
    /* Complete CSS value, e.g. "2px dashed teal" */
    outline: ${input.outline};
    /* Unitless number multiplied by a unit */
    outline-offset: calc(${input.offset} * 1px);
  }
</style>

<div class="dropzone">Drop files here</div>
```

> [!TIP]
> To emit a literal inline HTML `<style>` element, use [`<html-style>`](#html-script--html-style).

## `<define>`

Creates reusable local markup snippets within a template:

```marko
<define/MyTag|input: { name: string }| foo=1>
  <span>Hello ${input.name}</span>
</define>

<MyTag name="HTML"/>
<MyTag name="Marko"/>

<div>${MyTag.foo}</div>
```

The [tag variable](./language.md#tag-variables) exposes all attributes passed to `<define>` (including its `content`). A `<return>` inside the body is exposed at the call site where the snippet renders (see [Content Return](#content-return)).

> [!TIP]
> `<define>` is conceptually equivalent to a component returning `input`:
>
> ```marko
> export type Input<T> = T;
>
> <return=input>
> ```

## `<lifecycle>`

Synchronizes imperative browser APIs across mount, update, and destroy phases:

```marko
<lifecycle
  onMount() {
    // Runs once when attached to the DOM
  }
  onUpdate() {
    // Runs when any reactive value read by the tag's attributes changes
  }
  onDestroy() {
    // Runs once when removed from the DOM
  }
/>
```

Any reactive value read by the tag's attributes triggers `onUpdate`, including values read inside `onMount`, `onDestroy`, or callbacks they create. Before each `onUpdate`, tag attributes are reassigned onto `this`, keeping `this` consistent across the tag's lifetime so callbacks registered in `onMount` always read fresh values. This also fits restore-and-persist flows (restore once in `onMount`, persist changes in `onUpdate`).

```marko
client import { createEditor } from "code-editor";

<let/readOnly=false>
<div/host/>
<lifecycle
  readOnly=readOnly
  onMount() {
    const editor = createEditor(host());
    editor.on("beforeinput", (event) => {
      if (this.readOnly) event.preventDefault();
    });
    return { editor };
  }
  onUpdate() {
    this.editor.setReadOnly(this.readOnly);
  }
  onDestroy() {
    this.editor.destroy();
  }
/>
```

Returning an object from `onMount` attaches its properties to `this` with automatic type inference:

```marko
client import { WorldMap } from "world-map-api";

<let/latitude=0>
<let/longitude=0>
<div/container/>
<lifecycle
  onMount() {
    return { map: new WorldMap(container(), { latitude, longitude }) };
  }
  onUpdate() {
    this.map.setCoords(latitude, longitude);
  }
  onDestroy() {
    this.map.destroy();
  }
/>
```

> [!WARNING]
> Because tag attributes are reassigned onto `this` on every update, `onMount` must not return or assign property names that collide with attributes on the `<lifecycle>` tag.

Extra properties can also be assigned directly onto `this` by supplying a type argument:

```marko
client import { BarChart } from "bar-chart";

<canvas/canvas/>
<lifecycle<{ chart?: BarChart }>
  onMount() {
    this.chart = new BarChart(canvas());
  }
  onDestroy() {
    this.chart?.destroy();
  }
/>
```

## `<id>`

Exposes a short, unique ID string through its [tag variable](./language.md#tag-variables), suitable for HTML [`id`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/id) and ARIA attributes:

```marko
<id/cheeseId/>
<label for=cheeseId>Do you like cheese?</label>
<input id=cheeseId type="checkbox" name="cheese">
```

When `value=` is a non-empty string, `<id>` returns that value instead; `undefined`, `null`, `false`, and `""` fall back to the generated ID:

```marko
export interface Input {
  id?: string;
  description: string;
}

<id/id=input.id>

<input aria-describedby=id>
<span id=id>${input.description}</span>
```

## `<log>`

Calls [`console.log`](https://developer.mozilla.org/en-US/docs/Web/API/console/log_static) with `value=` on initial render (server and client) and whenever any reactive value read in `value=` changes:

```marko
<let/count=0>
<log=`Current count: ${count}`>
<button onClick() { count++ }>Log</button>
```

## `<debug>`

Inserts a [`debugger`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/debugger) statement that pauses when the tag renders:

```marko
export interface Input {
  stuff: unknown;
}

<const/{ stuff }=input>

// Pause to inspect render-scoped variables
<debug/>
```

When given a `value=` attribute, `<debug>` runs on initial render and whenever any reactive dependency in `value=` changes:

```marko
export interface Input {
  firstName: string;
  lastName: string;
}

<debug=[input.firstName, input.lastName]>
```

## `<await>`

Unwraps a promise from `value=` and passes its resolved value through a [tag parameter](./language.md#tag-parameters). Non-promise values render synchronously without triggering a placeholder:

```marko
<await|user|=getUser()>
  <img src=user.avatar>
  ${user.name}
</await>
```

When nested inside a [`<try>`](#try) tag with [`@placeholder`](#placeholder), the placeholder displays while the promise is pending:

```marko
<try>
  <div>
    <await|user|=getUser()>
      ${user.name}
    </await>
  </div>

  <@placeholder>Loading...</@placeholder>
  <@catch|err|>${err.message}</@catch>
</try>
```

## `<try>`

Defines error and async boundaries around its content. Accepts `@catch` and `@placeholder` [attribute tags](./language.md#attribute-tags); at least one must be provided.

### `@catch`

Catches errors thrown while rendering the `<try>` content or its `@placeholder`, including rejected [`<await>`](#await) promises and failed [lazy-loaded tag](./lazy-loading.md#placeholders--errors) fetches. The thrown error is passed as the `@catch` [tag parameter](./language.md#tag-parameters):

```marko
<try>
  <const/data=JSON.parse(input.rawJson)>
  <p>${data.title}</p>

  <@catch|err|>
    <p>Invalid data: ${err.message}</p>
  </@catch>
</try>
```

Errors thrown inside event handlers, [`<script>`](#script) bodies, or [`<lifecycle>`](#lifecycle) hooks occur outside the render path and propagate to the standard window error handler rather than `@catch`.

### `@placeholder`

Displays fallback content while any nested [`<await>`](#await) promise is pending, or while a [lazily loaded tag](./lazy-loading.md#placeholders--errors) is waiting for its trigger or loading its bundle in the browser.

## `<html-comment>`

Outputs a literal HTML `<!-- comment -->` (standard [comments](./language.md#comments) are stripped). Interpolations inside `<html-comment>` escape `>` to `&gt;`:

```marko
<html-comment>Hello, view source</html-comment>
```

Exposes a [tag variable](./language.md#tag-variables) getter returning the DOM [`Comment`](https://developer.mozilla.org/en-US/docs/Web/API/Comment) node:

```marko
<html-comment/commentNode/>

<return() {
  return commentNode().parentElement?.getBoundingClientRect();
}/>
```

## `<html-script>` & `<html-style>`

Marko's [`<script>`](#script) and [`<style>`](#style) tags provide reactive browser effects and bundled CSS. When a literal HTML `<script>` or `<style>` element is required (such as an import map or inline JSON data), use `<html-script>` and `<html-style>`:

```marko
// Emits a literal HTML `<script>` element
<html-script type="importmap">
  { "imports": { "square": "./module/shapes/square.js" } }
</html-script>

// Emits a literal HTML `<style>` element
<html-style>
  @import url("https://fonts.googleapis.com/css2?family=Ubuntu&display=swap");
</html-style>
```

> [!CAUTION]
> Contents of `<html-script>` and `<html-style>` execute as code, and interpolations escape only enough to avoid closing the element, so untrusted values expose the page to [XSS](https://developer.mozilla.org/en-US/docs/Web/Security/Attacks/XSS). Never interpolate user-provided content into them.
>
> Inside [`<svg>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/svg) or [`<math>`](https://developer.mozilla.org/en-US/docs/Web/MathML/Reference/Element/math), these tags parse as markup rather than raw text, so an interpolated `<` opens a real element. Never nest them in SVG or MathML with user-provided content.


----------

<!-- native-tag.md -->

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


----------

<!-- lazy-loading.md -->

# Lazy Loading

By default, every [custom tag](./custom-tag.md) used on a page is bundled into that page's JavaScript. Adding a `load` [import attribute](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import/with) splits the tag into its own browser bundle, fetched only after a [trigger](#triggers) fires.

```marko
import VideoPlayer from "<video-player>" with { load: "visible#hero" };

<section#hero>
  <VideoPlayer src=input.src/>
</section>
```

On the server, a lazily loaded tag renders its HTML immediately like any other tag; only its browser JavaScript is deferred until the trigger fires and the bundle arrives. In the browser, nothing renders in the tag's place until both the trigger and bundle resolve, and [`<try>`](./core-tag.md#try) can display [placeholder content](#placeholders--errors) in the meantime.

Attributes passed to a lazily loaded tag stay reactive while it loads, so the tag receives the latest values when its bundle arrives.

> [!NOTE]
> The `load` attribute applies to default imports of [custom tags](./custom-tag.md) (relative paths or [tag `import` shorthand](./language.md#tag-import-shorthand)) declared before their first use. Lazily loaded tags render directly without tag variables.

## Triggers

The `load` value is a static string read at build time: either `"render"` alone, or one or more triggers joined with `|`.

| Trigger             | Selector | Options              | Fires when                                        |
| :------------------ | :------- | :------------------- | :------------------------------------------------ |
| `render`            | None     | None                 | The tag renders (cannot combine with `\|`)        |
| `visible<selector>` | Required | `rootMargin=<css>`   | The matched element enters the viewport           |
| `idle`              | None     | `timeout=<ms>`       | The browser becomes idle                          |
| `media<query>`      | None     | None                 | `matchMedia(query)` matches                       |
| `on<Event><sel>`    | Required | None                 | The event first fires on the matched element      |

Selectors match via [`document.querySelector`](https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelector): `visible#hero`, `visible.hero`, and `visible[data-hero]` attach directly, while a bare type selector needs a leading space (`visible section`).

> [!NOTE]
> During SSR, the trigger script runs as the tag's HTML chunk flushes, so the watched element must already exist in the document. If a selector matches no element, the bundle loads immediately.

### `render`

Splits the tag into its own bundle loaded as soon as the tag renders, useful for conditional or heavy components. Must be used alone (cannot combine with [multiple triggers](#multiple-triggers)).

```marko
import MarkdownEditor from "<markdown-editor>" with { load: "render" };

<MarkdownEditor value=input.draft/>
```

### `visible`

Loads the bundle when the matched element enters the viewport via [`IntersectionObserver`](https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver):

```marko
import Comments from "<comments>" with { load: "visible.comments" };

<section.comments>
  <Comments post=input.post/>
</section>
```

Pass `rootMargin` in a query string to preload before the element enters the viewport:

```marko
import Comments from "<comments>" with { load: "visible.comments?rootMargin=100px" };
```

### `idle`

Loads the bundle when the browser is idle via [`requestIdleCallback`](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestIdleCallback) (or immediately if unsupported). Accepts an optional `timeout` in milliseconds and no selector:

```marko
import Recommendations from "<recommendations>" with { load: "idle?timeout=2000" };

<Recommendations/>
```

### `media`

Loads the bundle once [`matchMedia`](https://developer.mozilla.org/en-US/docs/Web/API/Window/matchMedia) matches the given [media query](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_media_queries/Using_media_queries) (immediately if already matched). Accepts both parenthesized media features (`media(max-width: 768px)`) and media types (`media print`):

```marko
import MobileNav from "<mobile-nav>" with { load: "media(max-width: 768px)" };

<MobileNav/>
```

> [!TIP]
> Wrap a media-triggered tag in a [facade](#facade-tags) to apply the trigger consistently at every call site.

### Events

A trigger starting with `on` followed by `-` or a capital letter loads the bundle the first time that event fires on the matched element:

```marko
import EmojiPicker from "<emoji-picker>" with { load: "on-focus[name=message]" };

<input name="message" placeholder="Say something nice">
<EmojiPicker/>
```

Event casing follows [native event handler rules](./native-tag.md#event-handlers): `on-` preserves casing, while `onCamelCase` lowercases the event name (`on-click` and `onClick` are equivalent).

### Multiple Triggers

Join triggers with `|` to load as soon as the first one fires:

```marko
import ChatWidget from "<chat-widget>" with { load: "on-mouseover#chat | idle?timeout=5000" };

<button#chat>Chat with us</button>
<ChatWidget/>
```

## Facade Tags

Because `load` applies per import site, wrapping a heavy tag in a facade makes it lazily loaded everywhere without repeating the trigger.

> [!WARNING]
> All lazy import sites of the same tag share one bundle, so multiple imports of the same tag should declare the same trigger. A facade keeps the trigger in one place.

Place the implementation inside a nested [`tags/` directory](./custom-tag.md#relative-custom-tags) so only the facade can import it:

```text
tags/
  location-map/
    index.marko
    tags/
      map-impl.marko
```

```marko
/* tags/location-map/index.marko */
import MapImpl from "<map-impl>" with { load: "visible.location-map" };

<div.location-map>
  <MapImpl ...input/>
</div>
```

Consumers use `<location-map>` directly with no `load` attribute, and the wrapper provides the selector target for `visible`.

## Placeholders & Errors

In the browser, a lazily loaded tag integrates with [`<try>`](./core-tag.md#try) like [`<await>`](./core-tag.md#await): [`@placeholder`](./core-tag.md#placeholder) renders while waiting for the trigger and while the bundle fetches, and [`@catch`](./core-tag.md#catch) handles load failures:

```marko
import PriceChart from "<price-chart>" with { load: "visible.chart" };

<figure.chart>
  <try>
    <PriceChart symbol=input.symbol/>

    <@placeholder>Loading chart...</@placeholder>
    <@catch|err|>Failed to load chart: ${err.message}</@catch>
  </try>
</figure>
```

## Bundler Support

Lazy loading relies on the [`linkAssets`](./compiler.md#linkassets) compiler option, which [`@marko/vite`](https://github.com/marko-js/vite) and [Marko Run](../marko-run/getting-started.md) configure automatically.

> [!NOTE]
> Builds without `linkAssets` (such as `@marko/vite` with `linked: false`) cannot code-split; `with { load }` imports compile as eager imports and render normally.


----------

<!-- typescript.md -->

# TypeScript

Marko provides built-in TypeScript support for template inputs, reactive variables, native elements, and custom tags, with checking in editors and the CLI.

## Enabling TypeScript in your Marko project

For applications, place a [`tsconfig.json`](https://www.typescriptlang.org/docs/handbook/tsconfig-json.html) at the project root:

```text
src/
package.json
tsconfig.json
```

For [tag libraries](./custom-tag.md#installed-custom-tags), publish the output of [`@marko/type-check`](#ci-type-checking), which emits type-stripped `.marko` files alongside `.d.marko.ts` declaration files so consumers get full autocomplete and type checking.

> [!TIP]
> Codebases migrating incrementally between JavaScript and TypeScript can set `"script-lang"` to `"ts"` or `"js"` in a `marko.json`. Marko walks upward to the nearest `marko.json` defining `script-lang`, allowing per-directory opt-in or opt-out.

## Typing `input`

Exporting `Input` (`export interface Input` or `export type Input`) types the template's [`input`](./language.md#input) object:

```marko
export interface Input {
  currency: string;
  amount: number;
}

<label>
  Price in ${input.currency}:
  <input type="number" value=input.amount min=0 step=0.01>
</label>
```

Because `Input` is a standard TypeScript export, other `.marko` and `.ts` files can import and extend it:

```marko
import type { Input as PriceInput } from "<price-field>";
import type { ExtraTypes } from "./utils.ts";

export type Input = PriceInput & ExtraTypes;
```

```marko
import type { Input as PriceInput } from "<price-field>";

export interface Input extends PriceInput {
  discounted: boolean;
  expiresAt: Date;
}
```

### Generic `Input`

[Type parameters](https://www.typescriptlang.org/docs/handbook/2/generics.html) declared on `Input` are in scope throughout the template body (excluding module-level [`static` statements](./language.md#static)):

```marko
export interface Input<T> {
  options: T[];
  onSelect: (newVal: T) => unknown;
}

static function staticFn() {
  // ❌ `T` is not in scope in module-level statements
}

<const/instanceFn(val: T) {
  // ✅ `T` is in scope in the template body
}/>

<select onInput(_evt, el) { input.onSelect(input.options[+el.value]) }>
  <for|value, i| of=input.options>
    <option value=i>${value}</option>
  </for>
</select>
```

### Tag Documentation

A JSDoc comment above `export interface Input` (or the `@typedef Input` comment in a JavaScript template) documents the tag itself. Editors display it on hover at every call site, including JSDoc tags such as `@deprecated` and `@see`:

```marko
/**
 * Shows a rating out of five as filled stars.
 * @see https://example.com/design/rating
 */
export interface Input {
  /** The rating, from 0 to 5. */
  value: number;
}

<span role="img" aria-label=`${input.value} out of 5`>
  ${"★".repeat(input.value)}${"☆".repeat(5 - input.value)}
</span>
```

## Built-in Marko Types

Marko exposes its [type definitions](https://github.com/marko-js/marko/blob/main/packages/runtime-tags/index.d.ts) under the global `Marko` namespace:

| Type                                                        | Description                                                                                                                                 |
| :---------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------ |
| `Marko.Template<Input, Return>`                             | Default export of a `.marko` file (`typeof import("./template.marko").default`)                                                             |
| `Marko.TemplateOf<Signature>`                               | Generic template type emitted by `mtc` for parameterized templates                                                                          |
| `Marko.TemplateInput<Input>`                                | Object accepted by `render` and `mount`, combining `Input` with `$global`                                                                   |
| `Marko.Body<Params, Return>`                                | [Tag content](./language.md#tag-content) accepting parameter tuple `Params` and `<return>` attributes `Return`                              |
| `Marko.Renderable`                                          | Any value accepted by [`<${dynamic}/>`](./language.md#dynamic-tags): `string \| Marko.Template \| Marko.Body<any, any> \| { content: ... }` |
| `Marko.Global`                                              | Type of [`$global`](./language.md#global), extensible via [module augmentation](#typing-global)                                             |
| `Marko.RenderedTemplate`                                    | Return type of [`Template.render`](./template.md#templaterenderinput)                                                                       |
| `Marko.MountedTemplate<Input, Ret>`                         | Return type of [`Template.mount`](./template.md#templatemountinput-node-position)                                                           |
| `Marko.NativeTags`                                          | Map of all [native tags](./native-tag.md) to `Marko.NativeTag` entries (`Marko.NativeTags["div"]["input"]`)                                 |
| `Marko.NativeTag<Input, Return>`                            | Single entry in `Marko.NativeTags`: `Input` types attributes, `Return` types the [element ref](./native-tag.md#element-references)          |
| `Marko.HTMLAttributes<T>`                                   | Global attributes and events shared by HTML elements (`T` types handler target, defaulting to `Element`)                                    |
| `Marko.SVGAttributes<T>`                                    | Global attributes and events shared by SVG elements (`T` types handler target, defaulting to `Element`)                                     |
| `Marko.Input<Tag>` / `Marko.Return<Tag>`                    | Extract input or return types from a native tag name, custom tag, or `Marko.Body`                                                           |
| `Marko.BodyParameters<Body>` / `Marko.BodyReturnType<Body>` | Extract parameter tuple or return type from a `Marko.Body`                                                                                  |
| `Marko.AttrTag<T>`                                          | [Attribute tag](./language.md#attribute-tags) type combining the first instance with `[Symbol.iterator]` for repeated tags                  |

### Class API Types

Marko 5 Class API types (`Marko.Component`, `Marko.Out`, `Marko.Emitter`) have been removed; they remain available from `marko@5` when [using Marko 5 interop](../guide/marko-5-interop.md).

### Typing `content`

Use `Marko.Body` to type [`input.content`](./language.md#tag-content):

```marko
/* tags/child.marko */
export interface Input {
  content?: Marko.Body;
}
```

```marko
/* index.marko */
<child/>
<child>Text in body</child>
<child>
  <div>Any combination of tags</div>
</child>
```

Passing a non-`Body` value (such as a component reference directly to `content=`) fails type checking.

#### Typing Tag Parameters

Pass a tuple of parameter types as the first type argument to `Marko.Body`:

```marko
/* tags/for-by-two.marko */
export interface Input {
  to: number;
  content: Marko.Body<[number]>;
}

<for|i| from=0 to=input.to step=2>
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

All attribute tags are iterable even when passed once, so wrap attribute tag inputs in `Marko.AttrTag`:

```marko
export interface Input {
  option: Marko.AttrTag<Marko.HTML.Option>;
}

<select>
  <for|option| of=input.option>
    <option ...option/>
  </for>
</select>
```

### Extending Native Tags

Extend native HTML types from `Marko.HTML` or SVG types from `Marko.SVG`:

```marko
export interface Input extends Marko.HTML.Button {
  color: string;
}

<const/{ color, ...attrs }=input>

<button style=`color: ${color}` ...attrs/>
```

> [!TIP]
> Native tags accept [`content`](./native-tag.md#content) as an attribute, so `<button ...attrs/>` forwards `input.content` automatically without an explicit body:
>
> ```marko
> <button style=`color: ${color}` ...attrs>
>   // no longer required
>   <${input.content}/>
> </button>
> ```

```marko
export interface Input extends Marko.SVG.Path {
  dashed: boolean;
}

<const/{ dashed, ...attrs }=input>

<path fill="none" stroke-dasharray=dashed && "6 3" ...attrs/>
```

### Custom Elements

First register the custom element as a native tag in [`marko.json`](./custom-tag.md#native-tag-registration), then augment `Marko.NativeTags`:

```json
/* marko.json */
{
  "<x-datepicker>": { "html": true }
}
```

```ts
/* x-datepicker.ts */
export class DatepickerElement extends HTMLElement {
  static observedAttributes = ["value"];
  get value() {
    return this.getAttribute("value") ?? "";
  }
}

interface DatepickerAttributes
  extends Omit<Marko.HTMLAttributes<DatepickerElement>, "onChange"> {
  value?: string;
  onChange?: (e: CustomEvent<string>, target: DatepickerElement) => void;
  onDateSelect?: (e: CustomEvent<string>, target: DatepickerElement) => void;
}

declare global {
  namespace Marko {
    interface NativeTags {
      "x-datepicker": Marko.NativeTag<DatepickerAttributes, DatepickerElement>;
    }
  }
}
```

```marko
/* index.marko */
<let/picked="2026-01-01">
<x-datepicker/picker
  value=picked
  onChange(evt) { picked = evt.detail }
/>
<button onClick() { picker().focus() }>Focus</button>
```

Extending `Marko.HTMLAttributes<T>` inherits global HTML attributes and events with `T` as the handler's second parameter. Declare `CustomEvent<T>` handlers directly on the attributes interface; when a custom event name collides with a standard DOM event (such as `onChange`), `Omit` that key from `Marko.HTMLAttributes<T>` first.

> [!NOTE]
> Marko writes attributes on registered custom elements via `setAttribute`, never as JavaScript properties. Declare `observedAttributes` on the custom element class to observe attribute updates, or assign properties through an element reference inside [`<script>`](./core-tag.md#script).

### Global HTML Attributes

Augment `Marko.HTMLAttributes` (or `Marko.SVGAttributes` for SVG) to add non-standard global attributes:

```ts
declare global {
  namespace Marko {
    interface HTMLAttributes {
      "my-non-standard-attribute"?: string;
    }
  }
}
```

### CSS Properties

The [`style=` object](./native-tag.md#style) uses `Marko.CSS.Properties` (extending [csstype](https://github.com/frenic/csstype)'s `PropertiesHyphen`). Augment it to type CSS custom properties:

```ts
declare global {
  namespace Marko {
    namespace CSS {
      interface Properties {
        "--accent"?: string;
      }
    }
  }
}
```

### Typing `$global`

`Marko.Global` includes an index signature so undeclared properties read as `unknown`. Augment `Marko.Global` in a declaration file (using a leading `export {}` to treat the file as a module) to type application-wide [`$global`](./language.md#global) properties:

```ts
export {};

declare global {
  namespace Marko {
    interface Global {
      locale?: string;
      requestId?: string;
    }
  }
}
```

> [!WARNING]
> Properties declared without `?` become required on every `$global` passed to `render` or `mount`.

## TypeScript Syntax in `.marko`

Any JavaScript expression inside a `.marko` file accepts TypeScript syntax:

```marko
<my-tag foo=1 as any>
  ${(input.el as HTMLInputElement).value}
</my-tag>
```

### Tag Type Parameters

Declare generic type parameters on [tag parameters](./language.md#tag-parameters) before the pipe list:

```marko
<child <T>|value: T|>
  <div>${value}</div>
</child>
```

### Tag Type Arguments

Supply explicit type arguments on a tag when inference is insufficient, or when initializing a `<let>` to `null` under `strictNullChecks`:

```marko
/* tags/child.marko */
export interface Input<T> {
  value: T;
}
```

```marko
/* index.marko */
<child<number> value=1/>
<let<string | null>/selected=null>
```

### Method Type Parameters

Method shorthands accept TypeScript type parameters directly after the method name:

```marko
<child process<T>(item: T) { return item }/>
```

### Attribute Type Assertions

Narrow inferred attribute or `<let>` types with TypeScript's [`as` operator](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#type-assertions):

```marko
<let/handler=null as (() => void) | null>
<some-component number=1 as const names=[] as string[]/>
```

## JSDoc Support

JavaScript projects can adopt type checking incrementally through [JSDoc annotations](https://www.typescriptlang.org/docs/handbook/intro-to-js-ts.html).

### Setup

Enable checking per file by adding `// @ts-check` at the top, or check all `.marko` and `.js` files project-wide with a [`jsconfig.json`](https://www.typescriptlang.org/docs/handbook/tsconfig-json.html#using-tsconfigjson-or-jsconfigjson) setting `"checkJs": true` (opting individual files out with `// @ts-nocheck`):

```marko
// @ts-check

/**
 * @typedef {{
 *   firstName: string,
 *   lastName: string,
 * }} Input
 */

<div>${input.firstName} ${input.lastName}</div>
```

## CI Type Checking

Run [`@marko/type-check`](https://github.com/marko-js/language-server/tree/main/packages/type-check) via its `mtc` CLI to check `.marko` files in CI and emit declarations for libraries:

```sh
npx mtc
```

## Profiling Performance

Pass [`--generateTrace`](https://www.typescriptlang.org/tsconfig/#generateTrace) to `mtc` to profile slow type checks:

```sh
mtc --generateTrace TRACE_DIR
```


----------

<!-- concise-syntax.md -->

# Concise Syntax

Marko's concise syntax omits angle brackets and closing tags, using indentation to express nesting.

Every `.marko` file starts in concise mode. An HTML-mode tag switches to HTML mode for its own body, returning to concise mode once closed so both syntaxes can coexist in one file.

```marko no-format
div class="thumbnail"
  img src="https://example.com/thumb.png"

// identical to
<div class="thumbnail"><img src="https://example.com/thumb.png"/></div>
```

## Attributes on multiple lines

Attributes can be comma-separated on a single line or split across lines with trailing commas:

```marko no-format
div id="hello", class=["class1", "class2", "class3"], style={ border: "1px solid red" }

div id="hello" class="world",
  style={ border: "1px solid red" }
```

Indented lines beginning with a leading comma also attach attributes to the preceding tag, which is the conventional multiline style:

```marko no-format
div
  ,id="hello"
  ,class=["class1", "class2", "class3"]
  ,style={ border: "1px solid red" }
  -- hello
```

## Text

Two or more hyphens (`--`) followed by whitespace begin [tag content](./language.md#tag-content). When text follows on the same line, the text ends at the newline:

```marko no-format
-- Hello world
div -- Hello world
```

When `--` is followed by a newline, the text block runs until a matching run of hyphens or the next dedent. HTML-mode tags can appear freely inside text blocks:

```marko no-format
--
This is
multiline text at the
root of the template
--
details
  --
  Since this is normal tag content,
  regular <strong>HTML Mode</strong>
  tags may be used freely.
  --
  summary --
    This content is
    implicitly closed
```

> [!TIP]
> Use more than two hyphens when the text itself contains `--`; the closing delimiter must use the same number of hyphens as the opening one.
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

### Root Level Text

Because templates begin in concise mode, bare root text is parsed as tags with attributes:

```marko no-format
Hello World
Welcome to Marko

// parsed as
<Hello World></Hello><Welcome to Marko></Welcome>
```

Prefix root-level text with `--` delimiters:

```marko no-format
-- Welcome to Marko
```


----------

<!-- template.md -->

# Template API Reference

Every `.marko` file exposes its runtime API on its [default export](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/export#using_the_default_export). [Targeted compilation](../explanation/targeted-compilation.md) emits [`render`](#templaterenderinput) in server builds and [`mount`](#templatemountinput-node-position) in browser builds.

## `Template.render(input)`

| Parameter | Default | Details                                                                                                              |
| :-------- | :------ | :------------------------------------------------------------------------------------------------------------------- |
| `input`   | `{}`    | Template [`input`](./language.md#input) object; may also include [`$global`](#inputglobal) for render-scoped globals |

Available in **server** builds. Returns a render result that can be consumed as a stream, async iterable, `ReadableStream`, promise, or synchronous string.

> [!WARNING]
> A render result can only be consumed once; later consumers fail (thrown, rejected, or emitted as a stream error). Awaiting the same result multiple times is the sole exception because the first `await` caches its promise.

### Async Iterator

The render result implements the [async iterable protocol](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols#the_async_iterator_and_async_iterable_protocols) for [`for await...of`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for-await...of), yielding HTML `string` chunks:

```js
import Template from "./template.marko";

for await (const chunk of Template.render({})) {
  // write the HTML chunk
}
```

Each iteration yields HTML flushed since the previous pull; synchronous renders yield a single chunk. Exiting the loop early (`break`, `return`, or throw) aborts any pending render, and calling `iterator.throw(reason)` aborts with `reason`.

### Pipe

`.pipe(target)` streams rendered HTML into a [Node.js `stream.Writable`](https://nodejs.org/api/stream.html#class-streamwritable) (or any object implementing `write(chunk)` and `end()`). If `target.flush()` exists, it is called after each chunk so buffering transforms such as [`zlib.createGzip()`](https://nodejs.org/api/zlib.html#zlibcreategzipoptions) flush incrementally:

```js
import http from "node:http";
import Template from "./template.marko";

http
  .createServer((req, res) => {
    Template.render({}).pipe(res);
  })
  .listen(3000);
```

### ReadableStream

`.toReadable()` returns a [WHATWG `ReadableStream<Uint8Array>`](https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream) yielding UTF-8 encoded chunks, suitable for Web APIs such as `Response` and edge runtimes:

```js
const response = new Response(Template.render({}).toReadable(), {
  headers: { "content-type": "text/html" },
});
```

Consumption starts on the stream's first pull, so an unread `Response` leaves the render unconsumed. Cancelling the stream aborts the render with the cancellation reason.

### Thenable

The render result is a [thenable](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise#thenables) whose resolved value is the full buffered HTML `string`, supporting `await`, `.then()`, `.catch()`, and `.finally()`:

```js
const html = await Template.render({});
```

> [!NOTE]
> Awaiting buffers the full HTML document into a single string rather than streaming chunks.

### `toString`

`.toString()` returns the rendered HTML synchronously when the template has no asynchronous content:

```js
const html = Template.render({}).toString();
```

> [!CAUTION]
> Any asynchronous rendering (such as [`<await>`](./core-tag.md#await)) or an already aborted [`$global.signal`](#globalsignal) causes `.toString()` to throw rather than return partial HTML.

## `Template.mount(input, node, position?)`

| Parameter  | Default       | Details                                                                                                                                                           |
| :--------- | :------------ | :---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `input`    | `{}`          | Template [`input`](./language.md#input) object; may also include [`$global`](#inputglobal)                                                                        |
| `node`     | *(required)*  | Light DOM `Element` where the template is inserted                                                                                                                |
| `position` | `"beforeend"` | Insertion point relative to `node`, matching [`Element.insertAdjacentHTML`](https://developer.mozilla.org/en-US/docs/Web/API/Element/insertAdjacentHTML#position) |

Available in **browser** builds. Builds the [reactive](./reactivity.md) DOM and inserts it relative to `node`:

```js
Template.mount({}, document.body); // append inside body
Template.mount({}, document.body, "afterbegin"); // prepend inside body
```

`node` must be a light DOM `Element` (not a `ShadowRoot` or `DocumentFragment`): Marko inherits the element's HTML namespace during parsing and delegates events on `document`.

> [!NOTE]
> Supported `position` values match [`insertAdjacentHTML()`](https://developer.mozilla.org/en-US/docs/Web/API/Element/insertAdjacentHTML#position):
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

### Mounted Instance

`Template.mount()` returns a mounted instance with methods to update or destroy the template and read its [return value](#instancevalue):

```js
const instance = Template.mount({ name: "foo" }, document.body);
```

> [!WARNING]
> Use `instance.update()` and `instance.destroy()` only at client-only mount boundaries or in tests. Within Marko templates, manage updates through the [reactive system](./reactivity.md).

#### `instance.update(input)`

Applies new [`input`](./language.md#input) synchronously as a reactive update. `$global` is fixed at mount time and ignored on updates:

```js
instance.update({ name: "bar" });
```

#### `instance.destroy()`

Removes the template's DOM nodes, aborts every [`$signal`](./language.md#signal), and runs cleanup hooks:

```js
instance.destroy();
```

#### `instance.value`

Reflects the [tag variable](./language.md#tag-variables) exposed by the template's [`<return>`](./core-tag.md#return):

```marko
/* color-picker.marko */
<let/color="#ff8000">
<input type="color" value:=color>
<return=color valueChange(newColor) { color = newColor }/>
```

```js
/* index.js */
import ColorPicker from "./color-picker.marko";

const instance = ColorPicker.mount({}, document.body);
instance.value; // "#ff8000"
instance.value = "#0080ff"; // invokes `valueChange` when return is assignable
```

## `input.$global`

A `$global` property passed in `input` to [`render`](#templaterenderinput) or [`mount`](#templatemountinput-node-position) is stripped from `input` and exposed as [`$global`](./language.md#global) across every template in the render tree. Application-specific globals sit alongside Marko's built-in properties and are typed on [`Marko.Global`](./typescript.md#typing-global).

### `$global.serializedGlobals`

> `string[] | Record<string, boolean> | undefined`

`$global` stays server-only by default. Properties listed in `serializedGlobals` are also serialized into the HTML so browser code can read them on [`$global`](./language.md#global):

```js
Template.render({
  $global: {
    locale: "en-GB",
    apiToken: "secret",
    serializedGlobals: ["locale"],
  },
});
```

An object form suits lists assembled across middleware, matching [Marko Run](../marko-run/runtime.md#context)'s `ctx.serializedGlobals`:

```js
serializedGlobals: { locale: true, apiToken: false }
```

Properties holding `undefined` are omitted.

> [!WARNING]
> Serialized values are embedded in the HTML response and visible to clients. Keep secrets off `serializedGlobals`.

### `$global.signal`

> <code>[AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) | undefined</code>

Aborts pending async rendering and cleans up active work when signaled, such as when an incoming HTTP request disconnects.

### `$global.cspNonce`

> `string | undefined`

Adds a `nonce` attribute to Marko-rendered `<script>` and `<style>` elements: [`<html-script>` and `<html-style>`](./core-tag.md#html-script--html-style), dynamic [`<style>`](./core-tag.md#dynamic-values) elements, and inline streaming/resume scripts. An explicit `nonce` attribute (or spread) on an element takes precedence.

Marko automatically serializes `cspNonce` to the client whenever it is set on `$global`, so it does not need to be listed in `serializedGlobals`.

```js
const cspNonce = crypto.randomUUID();

res.setHeader(
  "Content-Security-Policy",
  `script-src 'nonce-${cspNonce}'; style-src 'nonce-${cspNonce}'`,
);

Template.render({
  $global: { cspNonce },
}).pipe(res);
```

### `$global.renderId`

> `string | undefined`

Isolates multiple independent renders sharing one runtime in the same document. Defaults to `"_"`, except for non-page templates (whose rendered tag tree contains no `html`, `head`, or `body` element) compiled with [`linkAssets`](./compiler.md#linkassets), which receive a fresh random ID per `render()` call. `mount()` always defaults to `"_"`.

Set an explicit `renderId` when multiple renders of page templates share a document:

```js
Template.render({
  $global: { renderId: "cart" },
});
```

> [!WARNING]
> `renderId` and `runtimeId` become JavaScript identifiers in inline resume scripts and must match `/^[A-Za-z_][A-Za-z0-9_]*$/` (no UUIDs or hyphens).

### `$global.runtimeId`

> `string | undefined`

Names the global variable holding resume data for a Marko runtime instance (default `"M"`), isolating multiple Marko runtimes on the same page. Follows the same identifier rule as [`renderId`](#globalrenderid).

Server and browser builds must match, so configure `runtimeId` in the bundler (for example `@marko/vite`'s `runtimeId` option) rather than per render call.


----------

<!-- compiler.md -->

# Compiler API

`@marko/compiler` compiles `.marko` templates into JavaScript modules. [Bundler integrations](../introduction/integrations.md#bundlers) invoke it automatically; use this API directly when building bundler plugins, test transforms, or custom tooling.

```js
import * as compiler from "@marko/compiler";

const { code, map } = await compiler.compileFile("./src/card.marko", {
  output: "dom",
  sourceMaps: true,
});
```

## Compile Functions

Each compile function provides an async form and a synchronous `*Sync` counterpart with identical arguments.

### `compile(src, filename, options)`

| Parameter  | Details                                                          |
| :--------- | :--------------------------------------------------------------- |
| `src`      | Template source string                                           |
| `filename` | Template path used to resolve tags, relative imports, and its ID |
| `options`  | Optional [options](#options) overriding configured defaults      |

Returns a `Promise` of the [compile result](#compile-result); `compileSync(src, filename, options)` returns it synchronously. `filename` does not need to exist on disk.

```js
import { compileSync } from "@marko/compiler";

const { code } = compileSync(
  "<p>Order #${input.orderId} has shipped</p>",
  "/app/src/tags/shipping-notice.marko",
);
```

### `compileFile(filename, options)`

Reads `filename` via [`fileSystem`](#filesystem) and compiles it. `compileFileSync(filename, options)` is the synchronous form.

## Compile Result

| Property | Details                                                                                                                |
| :------- | :--------------------------------------------------------------------------------------------------------------------- |
| `code`   | Compiled JavaScript, or `null` when [`code`](#code) is `false`                                                         |
| `map`    | Source map when [`sourceMaps`](#sourcemaps) is `true` or `"both"` (and `code` is enabled without `entry`), else `null` |
| `ast`    | Final Babel AST when [`ast`](#ast) is `true`, otherwise `null`                                                         |
| `meta`   | Metadata gathered during compilation                                                                                   |

### Metadata

| Property       | Details                                                                                                     |
| :------------- | :---------------------------------------------------------------------------------------------------------- |
| `id`           | Template ID shared between server and browser outputs                                                       |
| `watchFiles`   | Non-template files affecting output (such as `marko.json`) for bundler file watching                        |
| `analyzedTags` | Optional list of templates whose analysis informed this compile and invalidate it on change                 |
| `diagnostics`  | Errors, warnings, deprecations, and suggestions with `type`, `label`, `loc`, and optional `fix`             |
| `api`          | Component API (`"tags"` or `"class"`), or `undefined` for custom translators without `preferAPI`            |

### Errors

Failed compiles throw a `CompileError` (check `err.name === "CompileError"` or `"CompileErrors"`, as these classes are not exported). Its `message` includes the file location and code frame; integrations formatting their own diagnostics read:

| Property   | Details                                                           |
| :--------- | :---------------------------------------------------------------- |
| `label`    | Error text without location or code frame                         |
| `loc`      | Optional source range (`start`, optional `end` lines and columns) |
| `frame`    | Formatted code frame                                              |
| `filename` | Template path                                                     |

Multiple errors throw a `CompileErrors` object with an `errors` array of `CompileError` instances.

## Configuration

`configure(options)` replaces the default [options](#options) for all subsequent compiles. Per-call options override defaults for that call only. Initial defaults can also be supplied as a JSON string in the `MARKO_CONFIG` environment variable.

```js
import * as compiler from "@marko/compiler";

compiler.configure({ sourceMaps: true, modules: "cjs" });

// Compiled with `sourceMaps: true` and `modules: "esm"`
const result = await compiler.compileFile("./src/receipt.marko", {
  modules: "esm",
});
```

## Require Hook

`@marko/compiler/register` installs a Node.js CommonJS `require` hook for `.marko` files (always compiling with `modules: "cjs"`):

```js
const register = require("@marko/compiler/register");

register({
  output: "html",
  sourceMaps: "inline",
  extensions: [".marko"],
});
```

## Options

### `output`

| Value       | Output                                                               |
| :---------- | :------------------------------------------------------------------- |
| `"html"`    | Server output that renders HTML (default)                            |
| `"dom"`     | Browser output that renders and updates the DOM                      |
| `"migrate"` | Template source after running migrations, without translating        |
| `"source"`  | Parsed template source, useful with [`ast`](#ast)                    |

Compiling the same template with `"html"` and `"dom"` produces its server and browser halves (see [Targeted Compilation](../explanation/targeted-compilation.md)).

### `entry`

Compiles the template as an entry point rather than a plain module. Requires [`linkAssets`](#linkassets).

| Value    | Entry                                                                                                                                    |
| :------- | :--------------------------------------------------------------------------------------------------------------------------------------- |
| `"page"` | With `output: "html"`, wraps the page to write its asset tags. With `output: "dom"`, emits the browser entry for that page               |
| `"load"` | With `output: "dom"`, emits the browser entry for a [lazily loaded](./lazy-loading.md) template                                          |

### `linkAssets`

Connects server output to browser asset bundles. Pass the same `linkAssets` configuration to both server and browser compiles, and render pages through their `entry: "page"` module so asset tags flush into the HTML.

| Property  | Details                                                                                                                                |
| :-------- | :------------------------------------------------------------------------------------------------------------------------------------- |
| `onAsset` | `onAsset(kind, file, id)` called for each page (`"page"`) or lazy import (`"load"`) needing a matching `output: "dom"` entry           |
| `runtime` | Absolute or virtual module ID imported by server output; exports `flush($global, type, id)` returning `"block"` or `"defer"` HTML tags |

```js
/* build.js */
import path from "node:path";
import { compileFile } from "@marko/compiler";

const assets = new Map();
const options = {
  linkAssets: {
    runtime: path.resolve("asset-runtime.js"),
    onAsset(kind, file, id) {
      assets.set(id, { kind, file });
    },
  },
};

const page = "./src/pages/checkout.marko";
const entry = await compileFile(page, {
  ...options,
  output: "html",
  entry: "page",
});
const template = await compileFile(page, { ...options, output: "html" });

for (const [id, { kind, file }] of assets) {
  const browser = await compileFile(file, {
    ...options,
    output: "dom",
    entry: kind,
  });
  // Bundle `browser.code`, then record the tags that load it under `id`.
}
```

```js
/* asset-runtime.js */
import manifest from "./dist/asset-manifest.json" with { type: "json" };

export function flush($global, type, id) {
  return manifest[id]?.[type] ?? "";
}
```

### `resolveVirtualDependency`

Templates can emit auxiliary virtual modules for `<style>` blocks and browser registration helpers. The compiler calls `resolveVirtualDependency(filename, dep)` for each virtual module and imports the returned specifier:

| Parameter         | Details                                                                          |
| :---------------- | :------------------------------------------------------------------------------- |
| `filename`        | Template that produced the virtual module                                        |
| `dep.virtualPath` | Suggested path (such as `./card.marko.css`)                                      |
| `dep.code`        | Virtual module source                                                            |
| `dep.map`         | Source map when [`sourceMaps`](#sourcemaps) is `true` or `"both"`                |

Preserving `virtualPath`'s extension lets the bundler apply standard CSS/JS handling. Without this option, `<style>` blocks are omitted from output; browser builds with cross-template registered imports require it.

```js
import path from "node:path";

const virtualModules = new Map();

function resolveVirtualDependency(filename, { virtualPath, code, map }) {
  const id = path.join(path.dirname(filename), "__virtual__", virtualPath);
  virtualModules.set(id, { code, map });
  return id;
}
```

### `modules`

Output module format: `"esm"` (default) or `"cjs"`.

### `optimize`

Enables production output: imports the production runtime and shortens internal identifiers. Defaults to `true` when `NODE_ENV` is set to anything other than `"development"`. `MARKO_DEBUG` overrides this, disabling optimization unless set to `false` or `0`.

### `optimizeKnownTemplates`

Ordered list of template paths assigned short sequential IDs when [`optimize`](#optimize) is enabled. Server and browser builds must share the same list.

### `runtimeId`

Isolates multiple Marko runtimes on one page. Must start with a letter or underscore and contain only letters, numbers, and underscores.

### `sourceMaps`

| Value      | Output                                   |
| :--------- | :--------------------------------------- |
| `false`    | No source map (default)                  |
| `true`     | Source map in result `map`               |
| `"inline"` | Source map comment inlined into `code`   |
| `"both"`   | Both `map` and inline comment            |

### `code`

Defaults to `true`. Set to `false` to skip code generation when only `meta` or `ast` is needed.

### `ast`

Defaults to `false`. Set to `true` to include the final Babel AST in the result.

### `stripTypes`

Strips TypeScript syntax from output. Defaults to `true` for every `output` except `"source"` and `"migrate"`.

### `translator`

Translator module ID or object. Defaults to the installed `marko` package's translator (or a `@marko/runtime-*` dependency in `package.json`).

### `fileSystem`

An `fs`-compatible object (`readFileSync`, `statSync`, `readdirSync`, plus `readFile` for `compileFile`, and optional `realpathSync` to resolve symlinked packages such as pnpm stores). Defaults to Node's `fs`.

### `cache`

A `Map` caching analyzed templates across compiles until a template or dependency changes. Compiles sharing a cache must use identical options apart from `output` and `entry` (`"source"` and `"migrate"` bypass the cache). Defaults to a shared process-wide `Map`.

### `babelConfig`

[Babel options](https://babeljs.io/docs/options) merged into the compiler's parse and generate configuration.

### `getTemplateId`

A `(filename) => id` hook overriding the default top-level template ID (percent-encoded root-relative path, or short hash/sequential ID when `optimize` is enabled). Unsafe characters in the returned ID are percent-encoded.

### `errorRecovery`

When `true`, records recoverable errors in `meta.diagnostics` instead of throwing (skipping translation and returning empty `code` when errors occur), useful for editor tooling.

### `applyFixes`

A `Map` selecting which migration fixes apply by diagnostic index and passing each mapped value to its fix. Defaults to applying all fixes.

## Tag Libraries

The `taglib` namespace controls tag discovery:

| Function                                                   | Details                                                                                                                                                     |
| :--------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `register(id, props)`                                      | Registers a tag library. Without `props`, loads a `.json` file path directly or `<id>/marko.json` for a package name                                        |
| `excludeDir(dirname)`                                      | Excludes `dirname` from tag discovery                                                                                                                       |
| `excludePackage(name)`                                     | Excludes package `name` from tag discovery                                                                                                                  |
| `buildLookup(dirname, translator?, onError?, fileSystem?)` | Builds the tag lookup for `dirname` using configured defaults; `onError` handles failed tag libraries without throwing                                      |
| `clearCaches()`                                            | Clears cached tag libraries after editing `marko.json`, `marko-tag.json`, or `package.json` (also clear [`cache`](#cache) to recompile dependent templates) |

## Runtime Information

| Export                                      | Details                                                                              |
| :------------------------------------------ | :----------------------------------------------------------------------------------- |
| `getRuntimeEntryFiles(output, translator?)` | Runtime modules imported by compiled templates for `output`, for bundler prebundling |
| `getRuntimeVersion(translator?)`            | Runtime version targeted by the translator                                           |
| `version`                                   | Installed `@marko/compiler` version                                                  |


----------

<!-- supported-environments.md -->

# Supported Environments

Marko targets modern browsers and maintained Node.js releases across both its compiler and runtime packages.

## Browser

Marko supports the browsers covered by eBay's [`browserslist-config`](https://github.com/eBay/browserslist-config/blob/master/index.js). `@marko/compiler` also respects a project's own `browserslist` configuration when generating browser output.

<browser-support></browser-support>

## Node.js

Marko packages require **Node.js `>=22.12.0`**, tracking actively maintained releases on the official [Node.js release schedule](https://nodejs.org/en/about/previous-releases).
