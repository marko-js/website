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
