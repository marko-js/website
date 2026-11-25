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
