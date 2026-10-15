# Patch Protocol

> [!TLDR]
>
> - Navigations update the live page instead of replacing it
> - The server sends targeted patches, not HTML to diff
> - Client state and event handlers survive navigation
> - Coming soon as an experimental feature

Normally, going to a new page replaces the document, and anything held in the browser starts over. With the patch protocol, the server sends only the values that changed, and the browser puts them into the page that is already there.

> [!NOTE]
> The patch protocol is not available to try yet. See [Coming Soon](../newsletter/august-2026.md#coming-soon) in the August newsletter and the [September update](../newsletter/september-2026.md) for progress so far.

## Persisted Pages

Persisted pages are the first feature built on the protocol. When a template is compiled with the `patches` option, navigation responses are patch renders instead of full HTML documents. The server streams updates that change the existing DOM, creating new structure where needed and leaving client-owned state alone.

A [`<let>`](../reference/core-tag.md#let) in a shared layout keeps its value, an open menu stays open, and a focused input keeps its text, while the content the server controls updates around them. [`<await>`](../reference/core-tag.md#await) and [`<try>`](../reference/core-tag.md#try) work as they do in a document, so loading and error states are unchanged.

## Fine-Grained Updates

The compiler knows every spot on a page where a server value can end up, such as a text node, an attribute, or an `<if>` branch. A patch addresses those spots directly through scopes and accessors, so no HTML is compared.

Elements unrelated to server data are never touched. They keep their identity, and client-owned state is never checked against server output. When a branch shows up that the browser has not built yet, the patch includes its markup once, along with its values.

## Marko Run

[Marko Run](../marko-run/getting-started.md) turns the protocol on with its `patches` option, which needs an adapter that provides a server.

With the option on, a small client router intercepts link clicks and form submissions that target app routes. Each one becomes a patch request, and the server renders the matching page as patches rather than a full document. The router handles history, scroll restoration, back/forward cache, fragment links, and autofocus the way the browser would.

Links and forms for routes that return something other than a page can opt out with `rel="external"`, which leaves navigation to the browser. If a patch cannot be applied correctly, the page falls back to a normal document load, so it is never left half updated.
