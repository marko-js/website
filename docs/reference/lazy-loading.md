# Lazy Loading

By default the JavaScript for every [custom tag](./custom-tag.md) used on a page is included in that page's bundle. The `load` [import attribute](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import/with) instead splits the tag into its own bundle, which is fetched in the browser only after a [trigger](#triggers) has fired.

```marko
import VideoPlayer from "<video-player>" with { load: "visible#hero" }

<section#hero>
  <VideoPlayer src=input.src/>
</section>
```

When rendered on the server, a lazily loaded tag writes its HTML immediately like any other tag. Only its client-side JavaScript is deferred, and the tag becomes interactive once the trigger has fired and its bundle has loaded.

When rendered in the browser, nothing is displayed in the tag's place until the trigger has fired and its bundle has loaded. The [`<try>` tag](./core-tag.md#try) can be used to show [placeholder content](#placeholders--errors) in the meantime.

Attributes passed to a lazily loaded tag remain reactive while it loads. Once its JavaScript arrives, the tag picks up the latest values.

> [!NOTE]
> The `load` attribute may only be used when importing a [custom tag](./custom-tag.md) as a [default import](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import#default_import). It works with both relative paths and the [tag `import` shorthand](./language.md#tag-import-shorthand).

## Triggers

The value of the `load` attribute is either [`"render"`](#render) or one or more triggers which determine when the tag's JavaScript is loaded.

Most triggers accept a [CSS selector](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_selectors) for an element to watch, and some accept additional options using a query string syntax.

> [!NOTE]
> If a trigger's selector does not match any element on the page, the tag's JavaScript is loaded immediately (with a warning in development).

### `render`

Loads the tag's JavaScript as soon as the tag is rendered.

```marko
import MarkdownEditor from "<markdown-editor>" with { load: "render" }

<MarkdownEditor value=input.draft/>
```

The `render` trigger does not wait for any user interaction. It splits the tag into its own bundle that is only loaded on pages which actually render the tag, which is useful for tags that are rendered conditionally or are heavy enough to be worth splitting out of the main bundle.

The `render` trigger must be used alone and cannot be combined with [multiple triggers](#multiple-triggers).

### `visible`

Loads the tag's JavaScript once the element matching the selector becomes visible in the viewport (via an [`IntersectionObserver`](https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver)).

```marko
import Comments from "<comments>" with { load: "visible#comments" }

<section#comments>
  <Comments post=input.post/>
</section>
```

The observer's [`rootMargin`](https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver/rootMargin) may be configured to begin loading before the element actually enters the viewport.

```marko
import Comments from "<comments>" with { load: "visible#comments?rootMargin=100px" }
```

### `idle`

Loads the tag's JavaScript when the browser is idle (via [`requestIdleCallback`](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestIdleCallback)). In browsers without `requestIdleCallback`, loading begins immediately.

```marko
import Recommendations from "<recommendations>" with { load: "idle" }

<Recommendations/>
```

A `timeout` (in milliseconds) may be provided to ensure loading begins even if the browser never becomes idle.

```marko
import Recommendations from "<recommendations>" with { load: "idle?timeout=2000" }
```

The `idle` trigger does not accept a selector.

### `media`

Loads the tag's JavaScript once the [media query](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_media_queries/Using_media_queries) in parentheses matches. Loading begins immediately if the query already matches, otherwise as soon as it first does.

```marko
import MobileNav from "<mobile-nav>" with { load: "media(max-width: 768px)" }

<MobileNav/>
```

This pairs well with tags hidden by CSS breakpoints, so that (for example) desktop users never download mobile-only UI.

### Events

A trigger beginning with `on` loads the tag's JavaScript the first time the matching event fires on the element matching the selector.

```marko
import EmojiPicker from "<emoji-picker>" with { load: "on-focus#message" }

<input#message placeholder="Say something nice">
<EmojiPicker/>
```

The event name follows the same casing rules as [event handler attributes](./native-tag.md#event-handlers): with `on-` the event name casing is preserved, otherwise the event name is all lowercased (so `on-click` and `onClick` are equivalent).

### Multiple Triggers

Multiple triggers may be combined with `|`. The tag's JavaScript is loaded when the first of them fires.

```marko
import ChatWidget from "<chat-widget>" with { load: "on-mouseover#chat | idle?timeout=5000" }

<button#chat>Chat with us</button>
<ChatWidget/>
```

## Placeholders & Errors

In the browser, a lazily loaded tag behaves like [async content](./core-tag.md#await): while its JavaScript is loading, a [`<try>`](./core-tag.md#try) ancestor displays its [`@placeholder`](./core-tag.md#placeholder) content, and if loading fails the error is handled by the nearest [`@catch`](./core-tag.md#catch).

```marko
import Comments from "<comments>" with { load: "on-click#show-comments" }

<let/show=false/>
<button#show-comments onClick() { show = true }>Show Comments</button>
<try>
  <if=show>
    <Comments post=input.post/>
  </if>

  <@placeholder>
    Loading comments...
  </@placeholder>

  <@catch|err|>
    Failed to load comments: ${err.message}
  </@catch>
</try>
```

## Bundler Support

Lazy loading is coordinated with the bundler through the `linkAssets` compiler option. [`@marko/vite`](https://github.com/marko-js/vite) (and therefore [Marko Run](../marko-run/getting-started.md)) configures this automatically, so no setup is required.
