# Patch Protocol

> [!TLDR]
>
> - Navigations update the live page instead of loading a new document
> - Client state, focus, and handlers survive, and the server sends only what changed
> - Enabled per application with the `patches` option
> - Experimental, coming soon

A server-rendered page usually starts over on every navigation: the browser discards the document (along with every `<let>`, focused field, and scroll position), then parses and resumes a new one. Persisted pages, built on the patch protocol, keep the live document. When a link or form targets another route in the same application, the server renders that route as a **patch**: a stream of updates applied directly to the existing page. New structure is created from shells carried by the response, changed values are written in place, and untouched elements keep their client state.

No HTML diffing happens on either side. Because the compiler knows every position where a server value can land, a patch writes values directly to those positions and leaves elements unrelated to server data alone.

> [!CAUTION]
> The patch protocol is experimental and not available to try yet. The option, response format, and client runtime may change in any release, including patch releases. See [Coming Soon](../newsletter/august-2026.md#coming-soon) in the August newsletter and the [September update](../newsletter/september-2026.md) for progress so far.

## Enabling

Pass `patches: true` to the [Marko Run Vite plugin](../marko-run/vite-plugin.md):

```ts
import { defineConfig } from "vite";
import marko from "@marko/run/vite";

export default defineConfig({
  plugins: [marko({ patches: true })],
});
```

This compiles every template to answer navigations with patches and installs the client router on each page.

## Navigations

The router intercepts clicks on same-application links and submissions of `GET` or `POST` forms targeting same-application routes. Navigations fall through to the browser when targeting another origin or window, when a modifier key is held, on `download` links, on same-page fragment links, or when `rel="external"` is set.

A handled navigation sends the same URL, method, and body the browser would send and applies the response as it streams:

- The document title and the route's [`+meta`](../marko-run/file-based-routing.md#meta) update with the page.
- A `POST` that redirects applies the target page and updates history to the final URL.
- Back and forward restore the visited entry's scroll position; new entries start at the top or at the target fragment.
- Repeated submissions of the same form while the first request is in flight are ignored.

Whenever a response cannot apply as a patch (a non-patch response, a network failure, or a page loaded from an earlier build), the router falls back to a full document navigation so every navigation lands on the server-rendered page. Special pages such as [`+404` and `+500`](../marko-run/file-based-routing.md#special-files) render as patches like any other route.

## Shared Layouts

A [layout](../marko-run/file-based-routing.md#layoutmarko) keeps its client state while the nested page changes. Consider a shop with a cart drawer in the root layout:

```marko
/* src/routes/+layout.marko */
export interface Input {
  content: Marko.Body;
}

<let/cartOpen=false>

<header>
  <a href="/">Shop</a>
  <button onClick() { cartOpen = !cartOpen }>
    Cart (${$global.cart.count})
  </button>
</header>

<if=cartOpen>
  <aside class="cart-drawer">
    <for|item| of=$global.cart.items by=(item) => item.id>
      <p>${item.name}</p>
    </for>
  </aside>
</if>

<main><${input.content}/></main>
```

```marko
/* src/routes/products/+page.marko */
<h1>Products</h1>
<a href="/about">About us</a>
```

With the drawer open, navigating to `/about` replaces the page inside `<main>` and updates the cart count from the server response while `cartOpen` stays `true` because the layout is patched in place.

## Client State

A component rendered in the same position before and after a navigation preserves its [`<let>`](../reference/core-tag.md#let) values, typed field text, and script-attached DOM state:

```marko
<form method="get">
  <input name="q" value=$global.search.q>
  <button>Search</button>
</form>

<let/expanded=false>
<button onClick() { expanded = !expanded }>Filters</button>
<if=expanded>
  <filter-panel/>
</if>
```

Submitting the form patches in the new results while keeping the filter panel open and the search input text intact. Because the `<input>` has no [`valueChange=`](./controllable-components.md) handler, user edits stay untouched.

## Scripts and Effects

Effects follow standard browser rendering rules: a [`<script>`](../reference/core-tag.md#script) runs when its content mounts, re-runs when a referenced reactive value changes, and aborts [`$signal`](../reference/language.md#signal) before each rerun and on removal. Content created by a patch runs its effects once the patch applies.

Because patched markup is created on the client, an inline `<html-script>` inside newly inserted markup is added to the DOM without executing.

## Content Security Policy

The client evaluates patch chunks as JavaScript. Pages served with a [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CSP) require `'unsafe-eval'` in `script-src` for patch navigations; without it, navigations fall back to full document loads.

## Supported Pages

Patches apply to Tags API pages rendered through [Marko Run route files](../marko-run/file-based-routing.md). Templates rendered outside Marko Run (such as embedded templates) navigate with full document loads.

## Page Size

Every page built with `patches: true` includes the client router, the used subset of the patch runtime, and HTML markers for patchable positions, making the initial document larger than a non-patched build. Subsequent patch responses are smaller than full documents because client-owned state is omitted and previously sent DOM shells are reused.
