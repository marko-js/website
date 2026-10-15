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

## Fine-Grained Updates

The patch protocol does not send HTML and diff it against the DOM. The compiler already knows which parts of a template can change, the same holes it uses to resume a page, so a patch addresses each one directly by scope and accessor and writes the new value in place. Text, attributes and control values that depend on server data are updated individually, and nodes that do not depend on it are never visited.

Because nothing is reconciled, existing elements are never rebuilt. They keep their identity, so focus, selection and scroll position are preserved, and client-owned state is never compared against server output.

When a patch cannot be applied, the page falls back to a full navigation.
