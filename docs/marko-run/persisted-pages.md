# Persisted Pages

> [!TLDR]
> - Navigations update the live page instead of loading a new document
> - Client state, focus and handlers survive, and the server sends only what changed
> - Enabled per application with the `patches` option
> - Experimental

> [!CAUTION]
> Persisted pages are experimental. The option, the response format and the client runtime may change in any release, including patch releases.

A server-rendered page usually starts over on every navigation: the browser discards the document, and with it every `<let>`, focused field and scroll position, then parses and resumes a new one. Persisted pages keep the document. When a link or form targets another route of the same application, the server renders that route as a **patch**, a stream of updates the live page applies to what it already shows. Structure that is new to the page is created from shells the response carries, values that changed are written in place, and everything else keeps the state it had.

## Enabling

Pass `patches` to the [Vite plugin](./vite-plugin.md):

```ts
import { defineConfig } from "vite";
import marko from "@marko/run/vite";

export default defineConfig({
  plugins: [marko({ patches: true })],
});
```

The option compiles every template to answer navigations with patches and installs the client router on each page. Each build answers only its own pages, so a page loaded from an earlier deploy navigates with full document loads until it reloads.

## Navigations

The router handles a click on a link to another route of the application, and the submission of a `GET` or `POST` form to one. It leaves a navigation to the browser when the link or form targets another origin or window, when a modifier key is held, for a `download` link, and for a link to a fragment of the current page.

A handled navigation requests the route with the same URL, method and body the browser would send, then applies the response as it streams:

- The document title and the route's [`+meta`](./file-based-routing.md#meta) update with the page.
- A `POST` that redirects applies the page it redirects to, and the history entry follows the final URL.
- Back and forward restore the scroll position of the entry being visited. A new entry starts at the top, or at the element its fragment names.
- A repeated submission of the same form while the first is in flight is not sent again.

Whenever a response cannot apply as a patch (a response that is not a patch, a network failure, or a build the page does not match), the router loads the URL as a document instead, so a navigation always ends on the page the server rendered. Routes such as [`+404` and `+500`](./file-based-routing.md#special-files) render as patches like any other page.

## Client State

State belongs to the page, as it does in client rendering. A component rendered in the same place before and after a navigation keeps its [`<let>`](../reference/core-tag.md#let) values, the text typed into its fields and the elements a script attached to it. Consider a search page:

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

Submitting the form patches the results in, while the open filter panel stays open and the search field keeps its text. The field's `value=` is the value it renders with. Without a [`valueChange=`](../explanation/controllable-components.md) handler, what the user typed stays, exactly as when the value changes in the browser.

To start a component over when the route changes, render it under a key derived from the route. A new key creates the component again:

```marko
<for|id| of=[$global.params.id] by=(id) => id>
  <product-gallery product=id/>
</for>
```

## Scripts and Effects

Effects follow the same rules as in client rendering. A [`<script>`](../reference/core-tag.md#script) runs when the content that contains it is created, runs again when a value it reads changes, and its [`$signal`](../reference/language.md#signal) aborts before each rerun and when its content is removed. Content a navigation creates runs its effects once the patch applies.

Markup inserted by a navigation is created by the client, so an inline `<html-script>` in it is added to the page without running.

## Content Security Policy

The client evaluates each part of a patch as JavaScript. A page served with a [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CSP) needs `'unsafe-eval'` in its `script-src` for its navigations to patch. Without it, each navigation loads the document.

## Supported Pages

Patches apply to the pages Marko Run renders from [route files](./file-based-routing.md). Templates rendered some other way, such as a template embedded inside another document, answer every navigation with a document.

Templates must use the [Tags API](../explanation/class-vs-tags-api.md).

## Page Size

Every page includes the client router and the part of the patch runtime its templates use, including pages that otherwise ship no JavaScript. Its HTML also carries the markers and values a later patch updates, so a document is larger than the same page built without `patches`.

A patch is always smaller than the document it replaces: values the page already renders from its own state are left out, and shells the page has already received are not sent again.
