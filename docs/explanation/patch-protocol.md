# Patch Protocol

> [!TLDR]
>
> - Server renders as patches that the browser applies to the live page
> - Powers persisted pages, where state survives navigation
> - No HTML diffing and no client-side router
> - Coming soon

Navigating between pages normally replaces the document, and any state held in the browser starts over. Marko's patch protocol is a different way for the server to talk to a page that is already running: rather than sending a whole document, the server sends only the values that changed, and the browser writes them into the nodes it already holds.

> [!NOTE]
> The patch protocol is not available to try yet. This page will be filled out as it nears release. For the work so far, see [Coming Soon](../newsletter/august-2026.md#coming-soon) in the August newsletter and the [September update](../newsletter/september-2026.md).

## How It Works

The compiler knows every hole a server value can land in, such as a text node, an attribute, or a conditional branch. A patch addresses those holes directly, so the browser applies each value to a node it already resumed, the same way an in-page update works today. There is no HTML diff on either side.

When a branch appears that the browser has not built yet, the patch carries its markup once as a shell along with the values for its holes.

## Persisted Pages

The first feature built on the protocol is persisted pages, which keep a page alive across navigations. A counter keeps counting, an open menu stays open, and text in an input stays put, while the content the server drives updates around it.

Templates remain ordinary Marko. The compiler works out which structure the server drives and which the browser owns, and anything a patch cannot express faithfully falls back to a full navigation, so a page is never left half updated.
