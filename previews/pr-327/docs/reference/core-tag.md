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

Under TypeScript's `strictNullChecks`, a `<let>` initialized to `null` keeps the type `null` without widening. Supply a [type argument or assertion](./typescript.md#tag-type-arguments):

```marko
<let<string | null>/selected=null>
<let/selected=null as string | null>
```

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
