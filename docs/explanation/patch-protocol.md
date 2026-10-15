# Patch Protocol

> [!TLDR]
>
> - Navigations patch the live page instead of replacing it
> - Client state and handlers survive between pages
> - Coming soon as an experimental feature

A multi-page app normally discards the document on every navigation, along with any client state it held. The patch protocol keeps the document alive: the server renders the next page as usual, but instead of HTML it streams updates that the already [resumed](./why-is-marko-fast.md#resumability) page applies to itself.

> [!IMPORTANT]
> The patch protocol is nearly complete and will ship soon as an experimental feature. Details may change before release.

## Persisted Pages

A template compiled with the `patches` option answers a navigation with a patch render. Each streamed flush writes changed values into the existing DOM, creates structure the page does not have yet (such as a newly selected branch or new loop rows), and leaves client-owned state alone. A `<let>` in a shared layout, an open menu, or a focused input survives the move from one route to the next.

`<await>` and `<try>` behave as they do in a document render, so loading and error states work unchanged.

## Shells

When a patch creates a body the page has never rendered, it ships a shell containing that body's markup and setup, so the client can build it without bundling the template ahead of time. Each response ends with a token naming the shells the page now holds, and the next navigation sends it back so the server skips them.

When a patch cannot be applied, the page falls back to a full navigation.
