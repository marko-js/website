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
